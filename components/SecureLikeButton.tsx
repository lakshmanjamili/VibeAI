'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Heart, Loader2, ShieldAlert } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import Script from 'next/script';

interface SecureLikeButtonProps {
  postId: string;
  initialLiked: boolean;
  initialCount: number;
  userId?: string;
}

export default function SecureLikeButton({
  postId,
  initialLiked,
  initialCount,
  userId
}: SecureLikeButtonProps) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);
  const [requiresCaptcha, setRequiresCaptcha] = useState(false);
  const [requiresProofOfWork, setRequiresProofOfWork] = useState(false);
  const [rateLimit, setRateLimit] = useState<{
    remaining: number;
    resetTime: number;
  } | null>(null);

  // Track user behavior for bot detection
  const actionLog = useRef<{ timestamp: number; action: string }[]>([]);
  const mouseMovements = useRef(0);
  const startTime = useRef(Date.now());

  // Hidden honeypot field
  const honeypotRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Track mouse movements
    const handleMouseMove = () => {
      mouseMovements.current++;
      actionLog.current.push({
        timestamp: Date.now(),
        action: 'mouse_move'
      });

      // Keep only last 50 actions
      if (actionLog.current.length > 50) {
        actionLog.current = actionLog.current.slice(-50);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Generate device fingerprint
  const generateFingerprint = async () => {
    const fingerprint = {
      userAgent: navigator.userAgent,
      screenResolution: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language,
      platform: navigator.platform,
      hardwareConcurrency: navigator.hardwareConcurrency,
      deviceMemory: (navigator as any).deviceMemory,
      colorDepth: screen.colorDepth,
      pixelRatio: window.devicePixelRatio,
      touchSupport: 'ontouchstart' in window,
      // Canvas fingerprinting
      canvas: await getCanvasFingerprint(),
      // WebGL fingerprinting
      webgl: getWebGLFingerprint(),
    };
    return fingerprint;
  };

  // Canvas fingerprinting
  const getCanvasFingerprint = async (): Promise<string> => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillStyle = '#f60';
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = '#069';
    ctx.fillText('VibeAI 🎨', 2, 15);
    
    return canvas.toDataURL();
  };

  // WebGL fingerprinting
  const getWebGLFingerprint = (): string => {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl');
    if (!gl) return '';

    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    if (!debugInfo) return '';

    return gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) + 
           gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
  };

  // Proof of Work solver
  const solveProofOfWork = async (challenge: string, expectedPrefix: string): Promise<string> => {
    let nonce = 0;
    const encoder = new TextEncoder();
    
    while (true) {
      const solution = nonce.toString();
      const data = encoder.encode(challenge + solution);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      
      if (hashHex.startsWith(expectedPrefix)) {
        return solution;
      }
      
      nonce++;
      
      // Prevent infinite loop
      if (nonce > 1000000) {
        throw new Error('Proof of work too difficult');
      }
    }
  };

  // Get or create session ID
  const getSessionId = (): string => {
    let sessionId = localStorage.getItem('vibe_session_id');
    if (!sessionId) {
      sessionId = `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('vibe_session_id', sessionId);
    }
    return sessionId;
  };

  const handleLike = async () => {
    if (loading) return;

    // Log action
    actionLog.current.push({
      timestamp: Date.now(),
      action: 'click_like'
    });

    // Check if action is too fast (bot-like)
    const timeSinceStart = Date.now() - startTime.current;
    if (timeSinceStart < 1000) {
      toast({
        title: 'Slow down!',
        description: 'Please wait a moment before voting',
        variant: 'destructive'
      });
      return;
    }

    // Check rate limit
    if (rateLimit && rateLimit.remaining === 0) {
      const waitTime = Math.ceil((rateLimit.resetTime - Date.now()) / 1000);
      toast({
        title: 'Rate limited',
        description: `Please wait ${waitTime} seconds before voting again`,
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);

    try {
      const sessionId = userId || getSessionId();
      const fingerprint = await generateFingerprint();

      // Prepare request body
      const body: any = {
        postId,
        sessionId,
        fingerprint,
        honeypot: honeypotRef.current?.value || '',
        timestamp: Date.now(),
        actionLog: actionLog.current.slice(-20) // Send last 20 actions
      };

      // Add CAPTCHA token if required
      if (requiresCaptcha && (window as any).hcaptcha) {
        const captchaResponse = await (window as any).hcaptcha.execute();
        body.captchaToken = captchaResponse.response;
      }

      // Solve proof of work if required
      if (requiresProofOfWork) {
        const challenge = Math.random().toString(36).substring(2);
        const solution = await solveProofOfWork(challenge, '0000');
        body.proofOfWork = {
          challenge,
          solution,
          expectedPrefix: '0000'
        };
      }

      // Send vote request
      const response = await fetch('/api/vote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle special cases
        if (data.requireCaptcha) {
          setRequiresCaptcha(true);
          toast({
            title: 'Verification required',
            description: 'Please complete the CAPTCHA to continue',
            action: (
              <Button onClick={() => handleLike()}>
                Verify
              </Button>
            )
          });
          return;
        }

        if (data.requireProofOfWork) {
          setRequiresProofOfWork(true);
          toast({
            title: 'Processing...',
            description: 'Solving verification challenge'
          });
          // Retry with proof of work
          handleLike();
          return;
        }

        throw new Error(data.error || 'Failed to vote');
      }

      // Update state
      setLiked(data.liked);
      setCount(prev => data.liked ? prev + 1 : Math.max(0, prev - 1));

      // Update rate limit info
      if (data.rateLimit) {
        setRateLimit(data.rateLimit);
      }

      toast({
        title: data.liked ? 'Liked!' : 'Unliked',
        description: `${data.rateLimit?.remaining || 'Several'} votes remaining`
      });

    } catch (error) {
      console.error('Vote error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to vote',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Load hCaptcha if needed */}
      {requiresCaptcha && (
        <Script
          src="https://js.hcaptcha.com/1/api.js"
          strategy="lazyOnload"
        />
      )}

      {/* Hidden honeypot field (bots will fill this) */}
      <input
        ref={honeypotRef}
        type="text"
        name="email_confirm"
        style={{ display: 'none' }}
        tabIndex={-1}
        autoComplete="off"
      />

      <Button
        onClick={handleLike}
        variant={liked ? 'default' : 'outline'}
        disabled={loading}
        className="gap-2 relative"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Heart className={`h-4 w-4 ${liked ? 'fill-current' : ''}`} />
        )}
        {count}
        
        {/* Show shield icon if extra verification is active */}
        {(requiresCaptcha || requiresProofOfWork) && (
          <ShieldAlert className="h-3 w-3 absolute -top-1 -right-1 text-yellow-500" />
        )}
      </Button>

      {/* Rate limit indicator */}
      {rateLimit && rateLimit.remaining < 5 && (
        <p className="text-xs text-muted-foreground mt-1">
          {rateLimit.remaining} votes remaining
        </p>
      )}
    </>
  );
}
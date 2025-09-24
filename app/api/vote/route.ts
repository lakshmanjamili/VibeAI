import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { 
  getClientIp, 
  hashIp, 
  checkRateLimit, 
  generateFingerprint,
  analyzeBehavior,
  verifyCaptcha,
  verifyProofOfWork,
  validateHoneypot,
  verifyTimeChallenge
} from '@/lib/antiSpam';

// Store for tracking behavior (use Redis in production)
const behaviorStore = new Map<string, any[]>();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      postId,
      sessionId,
      fingerprint,
      captchaToken,
      proofOfWork,
      honeypot,
      timeChallenge,
      timestamp,
      actionLog
    } = body;

    // 🛡️ Layer 1: Basic Validation
    if (!postId || !sessionId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // 🛡️ Layer 2: Honeypot Check
    if (!validateHoneypot(honeypot || '')) {
      console.warn('Honeypot triggered:', sessionId);
      // Don't reveal it's a honeypot, just act like it succeeded
      return NextResponse.json({ success: true, liked: true });
    }

    // 🛡️ Layer 3: IP-based Rate Limiting
    const clientIp = getClientIp();
    const hashedIp = hashIp(clientIp);
    
    const ipRateLimit = checkRateLimit(
      `ip:${hashedIp}`,
      30, // 30 votes per IP
      60000 * 5 // per 5 minutes
    );
    
    if (!ipRateLimit.allowed) {
      return NextResponse.json(
        { 
          error: 'Too many requests from this IP',
          retryAfter: ipRateLimit.resetTime
        },
        { status: 429 }
      );
    }

    // 🛡️ Layer 4: Session-based Rate Limiting
    const sessionRateLimit = checkRateLimit(
      `session:${sessionId}`,
      10, // 10 votes per session
      60000 // per minute
    );
    
    if (!sessionRateLimit.allowed) {
      return NextResponse.json(
        { 
          error: 'Too many requests',
          retryAfter: sessionRateLimit.resetTime
        },
        { status: 429 }
      );
    }

    // 🛡️ Layer 5: Device Fingerprint Check
    const fingerprintHash = generateFingerprint(fingerprint);
    
    // Check if this fingerprint has been used with different sessions recently
    const { data: recentFingerprints } = await supabase
      .from('anonymous_likes')
      .select('session_id, created_at')
      .eq('device_fingerprint', fingerprintHash)
      .gte('created_at', new Date(Date.now() - 60000 * 10).toISOString()) // Last 10 minutes
      .limit(10);
    
    const uniqueSessions = new Set(recentFingerprints?.map(r => r.session_id) || []);
    if (uniqueSessions.size > 3) {
      console.warn('Multiple sessions from same device:', fingerprintHash);
      // Require CAPTCHA for suspicious activity
      if (!captchaToken) {
        return NextResponse.json(
          { 
            error: 'Verification required',
            requireCaptcha: true
          },
          { status: 403 }
        );
      }
    }

    // 🛡️ Layer 6: Behavioral Analysis
    if (actionLog && actionLog.length > 0) {
      const behaviorAnalysis = analyzeBehavior(actionLog);
      
      if (behaviorAnalysis.isBot) {
        console.warn('Bot behavior detected:', {
          sessionId,
          confidence: behaviorAnalysis.confidence,
          reasons: behaviorAnalysis.reasons
        });
        
        // Require proof of work for suspicious behavior
        if (!proofOfWork || !verifyProofOfWork(
          proofOfWork.challenge,
          proofOfWork.solution,
          proofOfWork.expectedPrefix
        )) {
          return NextResponse.json(
            { 
              error: 'Verification required',
              requireProofOfWork: true,
              challenge: proofOfWork?.challenge
            },
            { status: 403 }
          );
        }
      }
    }

    // 🛡️ Layer 7: Time Challenge Verification
    if (timeChallenge && !verifyTimeChallenge(timeChallenge.token, timestamp)) {
      console.warn('Time challenge failed:', sessionId);
      return NextResponse.json(
        { error: 'Invalid request timing' },
        { status: 403 }
      );
    }

    // 🛡️ Layer 8: CAPTCHA Verification (if required)
    if (captchaToken) {
      const captchaValid = await verifyCaptcha(captchaToken);
      if (!captchaValid) {
        return NextResponse.json(
          { error: 'CAPTCHA verification failed' },
          { status: 403 }
        );
      }
    }

    // 🛡️ Layer 9: Check for Voting Anomalies
    const { data: recentVotes } = await supabase
      .from('anonymous_likes')
      .select('created_at, ip_hash')
      .eq('post_id', postId)
      .gte('created_at', new Date(Date.now() - 60000 * 5).toISOString()) // Last 5 minutes
      .limit(100);
    
    if (recentVotes && recentVotes.length > 50) {
      // Suspicious spike in votes
      console.warn('Vote spike detected for post:', postId);
      
      // Check IP diversity
      const uniqueIps = new Set(recentVotes.map(v => v.ip_hash));
      if (uniqueIps.size < 10) {
        // Less than 10 unique IPs for 50+ votes is suspicious
        return NextResponse.json(
          { 
            error: 'Unusual voting pattern detected',
            requireCaptcha: true
          },
          { status: 403 }
        );
      }
    }

    // 🛡️ Layer 10: Database Transaction with Fraud Check
    const { data, error } = await supabase.rpc('toggle_anonymous_like_secure', {
      p_post_id: postId,
      p_session_id: sessionId,
      p_ip_hash: hashedIp,
      p_device_fingerprint: fingerprintHash,
      p_user_agent: req.headers.get('user-agent') || '',
      p_metadata: {
        timestamp: new Date().toISOString(),
        clientIp: clientIp.substring(0, 3) + '***', // Store partial IP for analysis
        captchaVerified: !!captchaToken,
        proofOfWorkCompleted: !!proofOfWork
      }
    });

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to process vote' },
        { status: 500 }
      );
    }

    // Store behavior for future analysis
    const behaviors = behaviorStore.get(sessionId) || [];
    behaviors.push({
      timestamp: Date.now(),
      action: 'vote',
      postId,
      success: true
    });
    behaviorStore.set(sessionId, behaviors);

    // Return success with rate limit info
    return NextResponse.json({
      success: true,
      liked: data,
      rateLimit: {
        remaining: Math.min(ipRateLimit.remaining, sessionRateLimit.remaining),
        resetTime: Math.max(ipRateLimit.resetTime, sessionRateLimit.resetTime)
      }
    });

  } catch (error) {
    console.error('Vote API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
import { createHash } from 'crypto';
import { headers } from 'next/headers';

// Rate limiting store (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Fingerprinting data
interface DeviceFingerprint {
  userAgent: string;
  screenResolution?: string;
  timezone?: string;
  language?: string;
  platform?: string;
  hardwareConcurrency?: number;
  deviceMemory?: number;
  colorDepth?: number;
  pixelRatio?: number;
  touchSupport?: boolean;
  fonts?: string[];
  canvas?: string;
  webgl?: string;
  audioContext?: string;
}

/**
 * Generate a device fingerprint hash
 */
export function generateFingerprint(data: DeviceFingerprint): string {
  const fingerprintString = JSON.stringify(data);
  return createHash('sha256').update(fingerprintString).digest('hex');
}

/**
 * Get client IP address (works with Vercel, Cloudflare, etc.)
 */
export function getClientIp(): string {
  const hdrs = headers();
  
  // Check various headers that might contain the IP
  const forwardedFor = hdrs.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  
  const realIp = hdrs.get('x-real-ip');
  if (realIp) {
    return realIp;
  }
  
  const cfConnectingIp = hdrs.get('cf-connecting-ip');
  if (cfConnectingIp) {
    return cfConnectingIp;
  }
  
  return 'unknown';
}

/**
 * Hash IP address for privacy
 */
export function hashIp(ip: string): string {
  // Add a salt for extra security (store this in env)
  const salt = process.env.IP_HASH_SALT || 'default-salt';
  return createHash('sha256').update(ip + salt).digest('hex');
}

/**
 * Rate limiting check
 */
export function checkRateLimit(
  identifier: string,
  maxRequests: number = 10,
  windowMs: number = 60000 // 1 minute
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const record = rateLimitStore.get(identifier);
  
  // Clean up old entries
  if (record && record.resetTime < now) {
    rateLimitStore.delete(identifier);
  }
  
  if (!record || record.resetTime < now) {
    // New window
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + windowMs
    });
    
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetTime: now + windowMs
    };
  }
  
  if (record.count >= maxRequests) {
    // Rate limit exceeded
    return {
      allowed: false,
      remaining: 0,
      resetTime: record.resetTime
    };
  }
  
  // Increment counter
  record.count++;
  rateLimitStore.set(identifier, record);
  
  return {
    allowed: true,
    remaining: maxRequests - record.count,
    resetTime: record.resetTime
  };
}

/**
 * Behavioral analysis - detect bot patterns
 */
export function analyzeBehavior(actions: {
  timestamp: number;
  action: string;
}[]): { isBot: boolean; confidence: number; reasons: string[] } {
  const reasons: string[] = [];
  let suspicionScore = 0;
  
  if (actions.length < 2) {
    return { isBot: false, confidence: 0, reasons: [] };
  }
  
  // Check 1: Time between actions (bots often have consistent timing)
  const timeDiffs = [];
  for (let i = 1; i < actions.length; i++) {
    timeDiffs.push(actions[i].timestamp - actions[i - 1].timestamp);
  }
  
  const avgTimeDiff = timeDiffs.reduce((a, b) => a + b, 0) / timeDiffs.length;
  const variance = timeDiffs.reduce((sum, diff) => sum + Math.pow(diff - avgTimeDiff, 2), 0) / timeDiffs.length;
  const stdDev = Math.sqrt(variance);
  
  // Very consistent timing is suspicious
  if (stdDev < 100 && actions.length > 5) { // Less than 100ms variance
    suspicionScore += 40;
    reasons.push('Consistent action timing');
  }
  
  // Check 2: Too fast actions (superhuman speed)
  const tooFastActions = timeDiffs.filter(diff => diff < 500).length; // Less than 500ms
  if (tooFastActions > actions.length * 0.5) {
    suspicionScore += 30;
    reasons.push('Superhuman action speed');
  }
  
  // Check 3: No mouse movements or irregular patterns
  const mouseActions = actions.filter(a => a.action.includes('mouse'));
  if (mouseActions.length === 0 && actions.length > 10) {
    suspicionScore += 20;
    reasons.push('No mouse interactions');
  }
  
  // Check 4: Repetitive patterns
  const actionTypes = actions.map(a => a.action);
  const uniqueActions = new Set(actionTypes).size;
  if (uniqueActions < 3 && actions.length > 10) {
    suspicionScore += 30;
    reasons.push('Repetitive action patterns');
  }
  
  return {
    isBot: suspicionScore >= 50,
    confidence: Math.min(suspicionScore, 100),
    reasons
  };
}

/**
 * CAPTCHA verification (using hCaptcha or reCAPTCHA)
 */
export async function verifyCaptcha(token: string): Promise<boolean> {
  const secret = process.env.HCAPTCHA_SECRET || process.env.RECAPTCHA_SECRET;
  
  if (!secret) {
    console.warn('CAPTCHA secret not configured');
    return true; // Allow in development
  }
  
  try {
    const response = await fetch('https://hcaptcha.com/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `secret=${secret}&response=${token}`,
    });
    
    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error('CAPTCHA verification failed:', error);
    return false;
  }
}

/**
 * Anomaly detection for voting patterns
 */
export async function detectVotingAnomalies(
  postId: string,
  timeWindowMinutes: number = 5
): Promise<{ suspicious: boolean; reason?: string }> {
  // This would query your database
  // Example checks:
  // 1. Sudden spike in votes (100+ votes in 5 minutes)
  // 2. Votes from similar IP ranges
  // 3. Votes with identical fingerprints
  // 4. Geographic anomalies (votes from unusual locations)
  
  // Placeholder for actual implementation
  return { suspicious: false };
}

/**
 * Proof of Work - require computational effort
 */
export function generateProofOfWork(difficulty: number = 4): {
  challenge: string;
  expectedPrefix: string;
} {
  const challenge = Math.random().toString(36).substring(2);
  const expectedPrefix = '0'.repeat(difficulty);
  
  return { challenge, expectedPrefix };
}

export function verifyProofOfWork(
  challenge: string,
  solution: string,
  expectedPrefix: string
): boolean {
  const hash = createHash('sha256').update(challenge + solution).digest('hex');
  return hash.startsWith(expectedPrefix);
}

/**
 * Reputation scoring system
 */
export interface UserReputation {
  sessionId: string;
  score: number;
  totalActions: number;
  flaggedActions: number;
  lastUpdated: Date;
}

export function calculateReputationScore(reputation: UserReputation): number {
  // Base score starts at 100
  let score = 100;
  
  // Penalize for flagged actions
  const flagRate = reputation.flaggedActions / reputation.totalActions;
  if (flagRate > 0.5) score -= 50;
  else if (flagRate > 0.3) score -= 30;
  else if (flagRate > 0.1) score -= 10;
  
  // Bonus for longevity
  const accountAge = Date.now() - reputation.lastUpdated.getTime();
  const daysOld = accountAge / (1000 * 60 * 60 * 24);
  if (daysOld > 30) score += 10;
  if (daysOld > 90) score += 10;
  
  // Ensure score is between 0 and 100
  return Math.max(0, Math.min(100, score));
}

/**
 * Honeypot field detection
 */
export function validateHoneypot(honeypotValue: string): boolean {
  // Honeypot field should be empty (bots often fill all fields)
  return honeypotValue === '';
}

/**
 * Time-based challenge
 */
export function generateTimeChallenge(): {
  token: string;
  expiresAt: number;
} {
  const expiresAt = Date.now() + 30000; // 30 seconds
  const token = createHash('sha256')
    .update(`${expiresAt}-${process.env.TIME_CHALLENGE_SECRET || 'secret'}`)
    .digest('hex');
  
  return { token, expiresAt };
}

export function verifyTimeChallenge(token: string, submittedAt: number): boolean {
  // Verify the token hasn't expired and wasn't submitted too quickly
  const minTime = 2000; // Minimum 2 seconds to complete
  const timeTaken = Date.now() - submittedAt;
  
  if (timeTaken < minTime) {
    return false; // Submitted too quickly (likely a bot)
  }
  
  // Verify token validity (implement actual verification)
  return true;
}
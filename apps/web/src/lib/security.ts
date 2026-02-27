import { NextResponse } from 'next/server';

/**
 * Simple in-memory rate limiter for Next.js API routes.
 * Uses sliding window counter per IP.
 * 
 * For production at scale, replace with Redis-based solution.
 */

interface RateEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateEntry>();

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  store.forEach((entry, key) => {
    if (entry.resetAt < now) {
      store.delete(key);
    }
  });
}, 5 * 60 * 1000);

interface RateLimitConfig {
  maxRequests: number;   // Max requests per window
  windowMs: number;      // Window size in milliseconds
}

const DEFAULT_CONFIG: RateLimitConfig = {
  maxRequests: 60,
  windowMs: 60_000, // 60 requests per minute
};

const STRICT_CONFIG: RateLimitConfig = {
  maxRequests: 5,
  windowMs: 60_000, // 5 requests per minute (for auth endpoints)
};

const UPLOAD_CONFIG: RateLimitConfig = {
  maxRequests: 20,
  windowMs: 60_000, // 20 uploads per minute
};

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return request.headers.get('x-real-ip') || 'unknown';
}

/**
 * Check rate limit for a request.
 * Returns null if within limits, or a NextResponse if rate limited.
 */
export function checkRateLimit(
  request: Request,
  config: RateLimitConfig = DEFAULT_CONFIG,
  prefix: string = 'global'
): NextResponse | null {
  const ip = getClientIp(request);
  const key = `${prefix}:${ip}`;
  const now = Date.now();

  const entry = store.get(key);

  if (!entry || entry.resetAt < now) {
    store.set(key, { count: 1, resetAt: now + config.windowMs });
    return null;
  }

  entry.count++;

  if (entry.count > config.maxRequests) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    return NextResponse.json(
      { success: false, error: 'Troppe richieste. Riprova tra poco.' },
      {
        status: 429,
        headers: {
          'Retry-After': String(retryAfter),
          'X-RateLimit-Limit': String(config.maxRequests),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(entry.resetAt),
        },
      }
    );
  }

  return null;
}

/**
 * Rate limit presets for common endpoints.
 */
export const rateLimits = {
  default: DEFAULT_CONFIG,
  strict: STRICT_CONFIG,   // auth, password reset, etc.
  upload: UPLOAD_CONFIG,
} as const;

/**
 * Sanitize a string input to prevent XSS.
 * Strips HTML tags and encodes dangerous characters.
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/<[^>]*>/g, '') // Strip HTML tags
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Sanitize all string fields in an object (shallow).
 */
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  const sanitized = { ...obj };
  for (const [key, value] of Object.entries(sanitized)) {
    if (typeof value === 'string') {
      (sanitized as Record<string, unknown>)[key] = sanitizeInput(value);
    }
  }
  return sanitized;
}

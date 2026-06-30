import { Redis } from '@upstash/redis';
import type { NextRequest } from 'next/server';

export const ANALYZE_RATE_LIMIT = 5;
export const ANALYZE_WINDOW_SECONDS = 60 * 60;
export const ANALYZE_SESSION_COOKIE = 'jobfit-session';
export const ANALYZE_SESSION_HEADER = 'x-jobfit-session';
export const ANALYZE_RATELIMIT_HEADER = 'x-jobfit-rate-checked';
export const ANALYZE_RETRY_AFTER_HEADER = 'Retry-After';

type RateLimitBucketResult = {
  count: number;
  ttlSeconds: number;
};

type RateLimitResult =
  | {
      allowed: true;
      retryAfterSeconds: number;
      ip: RateLimitBucketResult;
      session: RateLimitBucketResult;
    }
  | {
      allowed: false;
      retryAfterSeconds: number;
      ip: RateLimitBucketResult;
      session: RateLimitBucketResult;
    };

const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

const redis =
  redisUrl && redisToken
    ? new Redis({
        url: redisUrl,
        token: redisToken,
      })
    : null;

function normalizeHeaderValue(value: string | null | undefined) {
  return value?.trim() || null;
}

function normalizeIp(ip: string) {
  return ip.trim().replace(/\s+/g, '-');
}

function getRequestIp(request: NextRequest | Request) {
  const headers = request.headers;
  const forwardedFor = normalizeHeaderValue(headers.get('x-forwarded-for'));
  const realIp = normalizeHeaderValue(headers.get('x-real-ip'));
  const connectingIp = normalizeHeaderValue(headers.get('cf-connecting-ip'));

  const rawIp = forwardedFor?.split(',')[0] ?? realIp ?? connectingIp ?? 'unknown-ip';
  return normalizeIp(rawIp);
}

export function getAnalyzeSessionId(request: NextRequest | Request) {
  const headerSession = normalizeHeaderValue(request.headers.get(ANALYZE_SESSION_HEADER));
  if (headerSession) {
    return headerSession;
  }

  if ('cookies' in request) {
    const cookieSession = normalizeHeaderValue(request.cookies.get(ANALYZE_SESSION_COOKIE)?.value);
    if (cookieSession) {
      return cookieSession;
    }
  }

  return null;
}

export function getAnalyzeIdentity(request: NextRequest | Request) {
  const ip = getRequestIp(request);
  const sessionId = getAnalyzeSessionId(request) ?? ip;

  return { ip, sessionId };
}

function getRedisClient() {
  if (redis) {
    return redis;
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error('Upstash Redis environment variables are missing.');
  }

  return null;
}

async function touchBucket(key: string): Promise<RateLimitBucketResult> {
  const client = getRedisClient();

  if (!client) {
    return {
      count: 0,
      ttlSeconds: ANALYZE_WINDOW_SECONDS,
    };
  }

  const count = await client.incr(key);

  if (count === 1) {
    await client.expire(key, ANALYZE_WINDOW_SECONDS);
  }

  const ttl = await client.ttl(key);

  return {
    count,
    ttlSeconds: ttl > 0 ? ttl : ANALYZE_WINDOW_SECONDS,
  };
}

function formatRetryAfterSeconds(ipTtlSeconds: number, sessionTtlSeconds: number) {
  return Math.max(ipTtlSeconds, sessionTtlSeconds, 1);
}

export async function checkAnalyzeRateLimit(request: NextRequest | Request): Promise<RateLimitResult> {
  const { ip, sessionId } = getAnalyzeIdentity(request);
  const [ipResult, sessionResult] = await Promise.all([
    touchBucket(`jobfit:rate-limit:analyze:ip:${ip}`),
    touchBucket(`jobfit:rate-limit:analyze:session:${sessionId}`),
  ]);

  const allowed = ipResult.count <= ANALYZE_RATE_LIMIT && sessionResult.count <= ANALYZE_RATE_LIMIT;
  const retryAfterSeconds = formatRetryAfterSeconds(ipResult.ttlSeconds, sessionResult.ttlSeconds);

  return {
    allowed,
    retryAfterSeconds,
    ip: ipResult,
    session: sessionResult,
  };
}

export function getRateLimitHeaders(retryAfterSeconds: number) {
  return {
    [ANALYZE_RETRY_AFTER_HEADER]: String(retryAfterSeconds),
    'X-RateLimit-Limit': String(ANALYZE_RATE_LIMIT),
    'X-RateLimit-Window': String(ANALYZE_WINDOW_SECONDS),
  };
}

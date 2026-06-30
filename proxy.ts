import { NextResponse, type NextRequest } from 'next/server';
import {
  ANALYZE_RATELIMIT_PROOF_HEADER,
  ANALYZE_SESSION_COOKIE,
  checkAnalyzeRateLimit,
  getAnalyzeIdentity,
  getAnalyzeSessionId,
  createAnalyzeRateLimitProof,
  getRateLimitHeaders,
} from '@/lib/rate-limit';

export async function proxy(request: NextRequest) {
  const { ip } = getAnalyzeIdentity(request);
  const sessionId = getAnalyzeSessionId(request) ?? crypto.randomUUID();
  const rateLimitResult = await checkAnalyzeRateLimit({ ip, sessionId });

  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      {
        error: 'Rate limit exceeded. You can analyze up to 5 resumes per hour. Please try again later.',
      },
      {
        status: 429,
        headers: getRateLimitHeaders(rateLimitResult.retryAfterSeconds),
      }
    );
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-jobfit-session', sessionId);
  requestHeaders.set(ANALYZE_RATELIMIT_PROOF_HEADER, createAnalyzeRateLimitProof(ip, sessionId));

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  if (!request.cookies.get(ANALYZE_SESSION_COOKIE)) {
    response.cookies.set({
      name: ANALYZE_SESSION_COOKIE,
      value: sessionId,
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
    });
  }

  return response;
}

export const config = {
  matcher: ['/api/analyze'],
};

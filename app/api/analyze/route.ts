import { NextRequest, NextResponse } from 'next/server';
import { extractTextFromFile } from '@/lib/parser';
import { calculateKeywordScore } from '@/lib/scoring';
import { analyzeResume } from '@/lib/llm';
import {
  checkAnalyzeRateLimit,
  isAnalyzeRateLimitProofValid,
  getRateLimitHeaders,
} from '@/lib/rate-limit';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB, matches your UI copy
const ALLOWED_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
];

async function verifyTurnstile(token: string, ip: string | null) {
  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      secret: process.env.TURNSTILE_SECRET_KEY,
      response: token,
      ...(ip ? { remoteip: ip } : {}),
    }),
  });
  return res.json();
}

export async function POST(req: NextRequest) {
  try {
    if (!isAnalyzeRateLimitProofValid(req)) {
      const rateLimitResult = await checkAnalyzeRateLimit(req);

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
    }

    const formData = await req.formData();
    const resumeFile = formData.get('resume') as File | null;
    const jdText = formData.get('jd') as string | null;
    const turnstileToken = formData.get('turnstileToken') as string | null;

    if (!turnstileToken) {
      return NextResponse.json({ error: 'CAPTCHA verification is required.' }, { status: 400 });
    }

    const ip = req.headers.get('x-forwarded-for');
    const verifyData = await verifyTurnstile(turnstileToken, ip);

    if (!verifyData.success) {
      console.warn('Turnstile verification failed:', verifyData['error-codes']);
      return NextResponse.json({ error: 'CAPTCHA verification failed. Please try again.' }, { status: 403 });
    }

    if (!resumeFile) {
      return NextResponse.json({ error: 'Resume file is required.' }, { status: 400 });
    }
    if (!jdText || jdText.trim().length === 0) {
      return NextResponse.json({ error: 'Job description is required.' }, { status: 400 });
    }

    // File validation — UI suggests these constraints but never enforces them server-side
    if (resumeFile.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'Resume file must be under 5MB.' }, { status: 400 });
    }
    if (!ALLOWED_TYPES.includes(resumeFile.type)) {
      return NextResponse.json({ error: 'Unsupported file type. Please upload PDF, DOCX, or TXT.' }, { status: 400 });
    }

    // 1. Parse Resume
    const resumeText = await extractTextFromFile(resumeFile);

    // 2. Keyword Scoring
    const { score: keywordScore } = calculateKeywordScore(resumeText, jdText);

    // 3. LLM Analysis
    const analysis = await analyzeResume(resumeText, jdText, keywordScore);

    // Return the combined result
    return NextResponse.json({
      success: true,
      data: {
        keywordScore,
        ...analysis,
      },
    });

  } catch (error: unknown) {
    console.error('Error in analyze API:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred during analysis.' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { extractTextFromFile } from '@/lib/parser';
import { calculateKeywordScore } from '@/lib/scoring';
import { analyzeResume } from '@/lib/llm';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const resumeFile = formData.get('resume') as File | null;
    const jdText = formData.get('jd') as string | null;

    if (!resumeFile) {
      return NextResponse.json({ error: 'Resume file is required.' }, { status: 400 });
    }
    if (!jdText || jdText.trim().length === 0) {
      return NextResponse.json({ error: 'Job description is required.' }, { status: 400 });
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
        ...analysis
      }
    });

  } catch (error: any) {
    console.error('Error in analyze API:', error);
    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred during analysis.' },
      { status: 500 }
    );
  }
}

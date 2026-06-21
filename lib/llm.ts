import { GoogleGenerativeAI } from '@google/generative-ai';
import { z } from 'zod';

const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export const analysisSchema = z.object({
  score: z.number().describe('An overall ATS score out of 100 representing how well the resume matches the job description.'),
  missingSkills: z.array(z.string()).describe('List of important skills from the JD that are missing in the resume.'),
  strongMatches: z.array(z.string()).describe('List of important skills from the JD that are present in the resume.'),
  weaknesses: z.array(z.string()).describe('General weaknesses in the resume (e.g., lack of quantifiable metrics, poor formatting).'),
  recommendations: z.array(z.string()).describe('Actionable recommendations for improving the resume.')
});

export type AnalysisResult = z.infer<typeof analysisSchema>;

export async function analyzeResume(resumeText: string, jdText: string, keywordScore: number): Promise<AnalysisResult> {
  const model = ai.getGenerativeModel({
    model: 'gemini-2.5-flash', 
    generationConfig: {
      responseMimeType: "application/json",
    }
  });

  const prompt = `
    You are an expert ATS (Applicant Tracking System) and technical recruiter.
    Analyze the following Resume against the provided Job Description.

    We have already calculated a basic keyword match score of: ${keywordScore}/100.
    Please incorporate this into your overall evaluation but adjust the final score based on semantic meaning and context (e.g., someone with "React" experience might be a good fit for a "Frontend Development" role even if the keyword isn't perfectly matched).

    Resume:
    """
    ${resumeText}
    """

    Job Description:
    """
    ${jdText}
    """

    Return a JSON object that exactly matches this schema:
    {
      "score": number (0-100),
      "missingSkills": [string],
      "strongMatches": [string],
      "weaknesses": [string],
      "recommendations": [string]
    }
  `;

  try {
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Attempt to parse JSON and validate with zod
    const json = JSON.parse(responseText);
    const validated = analysisSchema.parse(json);
    
    return validated;
  } catch (error) {
    console.error('Error calling Gemini API or parsing response:', error);
    throw new Error('Failed to analyze the resume using AI.');
  }
}

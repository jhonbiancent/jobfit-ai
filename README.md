# JobFit AI

JobFit AI is an AI-powered resume analyzer built by Jhon Biancent Recede to help job seekers understand how well their resume matches a specific job description before they apply.

Upload a resume, paste a job description, and the app will:

- extract the resume text from PDF, DOCX, or TXT files
- score keyword match quality
- identify missing skills and strengths
- generate actionable improvement suggestions with AI
- protect the analysis endpoint with CAPTCHA and rate limiting

## What it solves

Most applicants submit resumes blindly. JobFit AI gives them a fast compatibility check so they can:

- spot skill gaps before applying
- tailor their resume to the posting
- improve ATS compatibility
- save time on weak-fit roles

## How it works

1. The user uploads a resume and pastes a job description.
2. Cloudflare Turnstile verifies the request is human.
3. The server extracts text from the uploaded file.
4. A keyword matching score is calculated.
5. The AI model reviews both texts and returns detailed feedback.
6. The dashboard shows the analysis result.

## Security and abuse protection

The analysis endpoint is protected with:

- Upstash Redis rate limiting
- anonymous session cookies
- a `5 analyses per hour` limit per IP and per session
- a signed proxy-to-route proof so the API route can verify trusted requests

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS v4
- Cloudflare Turnstile
- Upstash Redis
- Google Generative AI
- Vercel Analytics

## Local Development

Install dependencies:

```bash
npm install
```

Run the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Project Structure

- `app/page.tsx` - landing page and upload flow
- `app/dashboard/page.tsx` - results dashboard
- `app/api/analyze/route.ts` - resume analysis endpoint
- `lib/parser.ts` - file text extraction
- `lib/scoring.ts` - keyword scoring
- `lib/llm.ts` - AI analysis
- `lib/rate-limit.ts` - Redis-backed rate limiting helpers

## Deployment

This app is ready for Vercel deployment.

Before deploying, make sure you:

- add all environment variables in Vercel
- configure your Upstash Redis database
- verify the Turnstile keys
- confirm the rate-limit secret matches your local environment

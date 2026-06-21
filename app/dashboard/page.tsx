'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle2, XCircle, AlertTriangle, Lightbulb, Target, RotateCcw } from 'lucide-react';
import { AnalysisResult } from '@/lib/llm';

type DashboardData = AnalysisResult & { keywordScore: number };

function ScoreRing({ score, size = 160, stroke = 10 }: { score: number; size?: number; stroke?: number }) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (circumference * score / 100);

  let color = '#22c55e'; // green
  if (score < 50) color = '#ef4444'; // red
  else if (score < 75) color = '#eab308'; // yellow

  return (
    <div className="score-ring" style={{ '--size': `${size}px`, '--stroke': stroke, '--score': score } as React.CSSProperties}>
      <svg viewBox={`0 0 ${size} ${size}`}>
        <circle
          className="track"
          cx={size / 2}
          cy={size / 2}
          r={radius}
        />
        <circle
          className="progress"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          style={{
            stroke: color,
            strokeDasharray: circumference,
            strokeDashoffset: offset,
          }}
        />
      </svg>
      <div className="label">
        <span className="text-5xl font-extrabold" style={{ color }}>{score}</span>
        <span className="text-xs text-slate-500 font-medium mt-1">out of 100</span>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const stored = sessionStorage.getItem('analysisResult');
    if (stored) {
      setData(JSON.parse(stored));
      setTimeout(() => setMounted(true), 100);
    } else {
      router.push('/');
    }
  }, [router]);

  if (!data) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 text-sm">Loading your results...</p>
        </div>
      </div>
    );
  }

  const scoreLabel = data.score >= 75 ? 'Strong Fit' : data.score >= 50 ? 'Moderate Fit' : 'Needs Work';
  const scoreLabelColor = data.score >= 75 ? 'text-green-400' : data.score >= 50 ? 'text-yellow-400' : 'text-red-400';

  return (
    <main className="max-w-6xl mx-auto px-6 py-8 md:py-12">
      {/* Navigation */}
      <div className="flex items-center justify-between mb-8 animate-fade-in-up">
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-white transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Dashboard
        </button>
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 text-sm text-brand-400 hover:text-brand-300 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          New Analysis
        </button>
      </div>

      {/* Score Hero */}
      <div className="glass-card p-8 md:p-10 mb-8 animate-fade-in-up delay-100">
        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
          {/* Score Ring */}
          <div className="shrink-0">
            <ScoreRing score={mounted ? data.score : 0} />
          </div>

          {/* Score Details */}
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Analysis Complete</h1>
            <p className="text-slate-400 mb-4">Here is how well your resume matches the job description.</p>

            <div className="flex flex-wrap justify-center md:justify-start gap-3">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border ${
                data.score >= 75 ? 'bg-green-500/10 border-green-500/20 text-green-400'
                  : data.score >= 50 ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'
                    : 'bg-red-500/10 border-red-500/20 text-red-400'
              }`}>
                {scoreLabel}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-white/5 border border-white/10 text-slate-400">
                Keyword Score: {data.keywordScore}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Results Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Strong Matches */}
        <div className="glass-card p-6 animate-fade-in-up delay-200">
          <h2 className="text-base font-semibold mb-5 flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-green-400" />
            </div>
            Strong Matches
            {data.strongMatches.length > 0 && (
              <span className="ml-auto text-xs text-slate-600 font-normal">{data.strongMatches.length} skills</span>
            )}
          </h2>
          {data.strongMatches.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {data.strongMatches.map((skill, i) => (
                <span key={i} className="skill-chip px-3 py-1.5 rounded-lg bg-green-500/10 text-green-300 border border-green-500/15 text-sm cursor-default">
                  {skill}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-slate-600 text-sm italic">No strong matches found.</p>
          )}
        </div>

        {/* Missing Skills */}
        <div className="glass-card p-6 animate-fade-in-up delay-300">
          <h2 className="text-base font-semibold mb-5 flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center">
              <XCircle className="w-4 h-4 text-red-400" />
            </div>
            Missing Skills
            {data.missingSkills.length > 0 && (
              <span className="ml-auto text-xs text-slate-600 font-normal">{data.missingSkills.length} skills</span>
            )}
          </h2>
          {data.missingSkills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {data.missingSkills.map((skill, i) => (
                <span key={i} className="skill-chip px-3 py-1.5 rounded-lg bg-red-500/10 text-red-300 border border-red-500/15 text-sm cursor-default">
                  {skill}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-slate-600 text-sm italic">No missing skills detected! Great job.</p>
          )}
        </div>

        {/* Weaknesses */}
        <div className="glass-card p-6 animate-fade-in-up delay-400">
          <h2 className="text-base font-semibold mb-5 flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-yellow-400" />
            </div>
            Areas of Concern
          </h2>
          {data.weaknesses.length > 0 ? (
            <ul className="space-y-2.5">
              {data.weaknesses.map((weakness, i) => (
                <li key={i} className="flex gap-3 text-sm text-slate-300 bg-black/20 p-3.5 rounded-xl border border-white/5 leading-relaxed">
                  <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-yellow-500 shrink-0" />
                  {weakness}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-slate-600 text-sm italic">No major weaknesses identified.</p>
          )}
        </div>

        {/* Recommendations */}
        <div className="glass-card p-6 animate-fade-in-up delay-500">
          <h2 className="text-base font-semibold mb-5 flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center">
              <Lightbulb className="w-4 h-4 text-accent-400" />
            </div>
            Recommendations
          </h2>
          {data.recommendations.length > 0 ? (
            <ul className="space-y-3">
              {data.recommendations.map((rec, i) => (
                <li key={i} className="flex gap-3 items-start bg-accent/5 p-4 rounded-xl border border-accent/10">
                  <Target className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                  <span className="text-sm text-slate-200 leading-relaxed">{rec}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-slate-600 text-sm italic">No further recommendations.</p>
          )}
        </div>
      </div>
    </main>
  );
}

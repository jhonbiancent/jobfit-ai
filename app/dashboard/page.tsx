'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle2, XCircle, AlertTriangle, Lightbulb, Target } from 'lucide-react';
import { AnalysisResult } from '@/lib/llm';

type DashboardData = AnalysisResult & { keywordScore: number };

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const router = useRouter();

  useEffect(() => {
    const stored = sessionStorage.getItem('analysisResult');
    if (stored) {
      setData(JSON.parse(stored));
    } else {
      // If no data, redirect to home
      router.push('/');
    }
  }, [router]);

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400">Loading your results...</p>
        </div>
      </div>
    );
  }

  // Determine score color
  let scoreColor = 'text-green-500';
  let scoreBg = 'bg-green-500/10 border-green-500/20';
  if (data.score < 50) {
    scoreColor = 'text-red-500';
    scoreBg = 'bg-red-500/10 border-red-500/20';
  } else if (data.score < 75) {
    scoreColor = 'text-yellow-500';
    scoreBg = 'bg-yellow-500/10 border-yellow-500/20';
  }

  return (
    <main className="max-w-6xl mx-auto px-6 py-12">
      <button 
        onClick={() => router.push('/')}
        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8 group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to Analyzer
      </button>

      <div className="flex flex-col md:flex-row gap-8 mb-12 items-center justify-between glass-card p-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Analysis Complete</h1>
          <p className="text-slate-400">Here is how well your resume matches the job description.</p>
        </div>
        
        <div className={`flex flex-col items-center justify-center p-6 rounded-2xl border ${scoreBg} min-w-50`}>
          <div className="text-sm font-medium uppercase tracking-wider text-slate-300 mb-1">ATS Score</div>
          <div className={`text-6xl font-extrabold ${scoreColor}`}>
            {data.score}<span className="text-3xl text-slate-500">/100</span>
          </div>
          <div className="text-xs text-slate-400 mt-2">Keyword Score: {data.keywordScore}/100</div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Strong Matches */}
        <div className="glass-card p-6">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-green-400">
            <CheckCircle2 className="w-6 h-6" />
            Strong Matches
          </h2>
          {data.strongMatches.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {data.strongMatches.map((skill, i) => (
                <span key={i} className="px-3 py-1.5 rounded-md bg-green-500/10 text-green-300 border border-green-500/20 text-sm">
                  {skill}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 italic">No strong matches found.</p>
          )}
        </div>

        {/* Missing Skills */}
        <div className="glass-card p-6">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-red-400">
            <XCircle className="w-6 h-6" />
            Missing Skills
          </h2>
          {data.missingSkills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {data.missingSkills.map((skill, i) => (
                <span key={i} className="px-3 py-1.5 rounded-md bg-red-500/10 text-red-300 border border-red-500/20 text-sm">
                  {skill}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 italic">No missing skills detected! Great job.</p>
          )}
        </div>

        {/* Weaknesses */}
        <div className="glass-card p-6">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-yellow-400">
            <AlertTriangle className="w-6 h-6" />
            Areas of Concern
          </h2>
          {data.weaknesses.length > 0 ? (
            <ul className="space-y-3">
              {data.weaknesses.map((weakness, i) => (
                <li key={i} className="flex gap-3 text-slate-300 bg-black/20 p-3 rounded-lg border border-white/5">
                  <div className="mt-1 w-1.5 h-1.5 rounded-full bg-yellow-500 shrink-0" />
                  {weakness}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-slate-500 italic">No major weaknesses identified.</p>
          )}
        </div>

        {/* Recommendations */}
        <div className="glass-card p-6">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-accent">
            <Lightbulb className="w-6 h-6" />
            Actionable Recommendations
          </h2>
          {data.recommendations.length > 0 ? (
            <ul className="space-y-4">
              {data.recommendations.map((rec, i) => (
                <li key={i} className="flex gap-3 items-start bg-accent/5 p-4 rounded-xl border border-accent/10">
                  <Target className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                  <span className="text-slate-200 leading-relaxed">{rec}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-slate-500 italic">No further recommendations.</p>
          )}
        </div>
      </div>
    </main>
  );
}

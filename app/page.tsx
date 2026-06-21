'use client';

import { useState } from 'react';
import { Upload, FileText, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [jdText, setJdText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleAnalyze = async () => {
    if (!file || !jdText.trim()) {
      setError('Please provide both a resume file and a job description.');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    const formData = new FormData();
    formData.append('resume', file);
    formData.append('jd', jdText);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to analyze resume.');
      }

      // In a stateless app, we can pass the result via sessionStorage before routing
      sessionStorage.setItem('analysisResult', JSON.stringify(result.data));
      router.push('/dashboard');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An unexpected error occurred.');
      setIsAnalyzing(false);
    }
  };

  return (
    <main className="max-w-5xl mx-auto px-6 py-12 flex flex-col items-center">
      <div className="text-center mb-12 mt-10">
      
        <h1 className="text-5xl md:text-6xl font-extrabold mb-6 tracking-tight">
          Is your resume <span className="gradient-text">JobFit?</span>
        </h1>
        <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Upload your resume and paste the job description. Our AI analyzes your fit, flags missing skills, and suggests targeted improvements to beat the ATS.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full">
        {/* Resume Upload */}
        <div className="glass-card p-6 md:p-8 flex flex-col lg:col-span-1 min-h-[250px] lg:min-h-full">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Upload className="w-5 h-5 text-brand-500" />
            1. Upload Resume
          </h2>
          <div className="flex-1 border-2 border-dashed border-card-border rounded-xl p-4 md:p-8 flex flex-col items-center justify-center text-center transition-colors hover:border-brand-500/50 relative">
            <input
              type="file"
              accept=".pdf,.docx,.txt"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            {file ? (
              <div className="flex flex-col items-center gap-3">
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-brand-500/20 flex items-center justify-center">
                  <FileText className="w-6 h-6 md:w-8 md:h-8 text-brand-500" />
                </div>
                <div>
                  <p className="font-medium text-slate-200 break-all px-2 text-sm md:text-base">{file.name}</p>
                  <p className="text-xs md:text-sm text-slate-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
            ) : (
              <>
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-slate-800/50 flex items-center justify-center mb-3 md:mb-4">
                  <Upload className="w-6 h-6 md:w-8 md:h-8 text-slate-400" />
                </div>
                <p className="font-medium text-slate-300 mb-1 text-sm md:text-base">Click to upload</p>
                <p className="text-xs md:text-sm text-slate-500">PDF, DOCX, or TXT (Max 5MB)</p>
              </>
            )}
          </div>
        </div>

        {/* Job Description */}
        <div className="glass-card p-6 md:p-8 flex flex-col lg:col-span-2">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-accent" />
            2. Paste Job Description
          </h2>
          <textarea
            value={jdText}
            onChange={(e) => setJdText(e.target.value)}
            placeholder="Paste the full job description here..."
            className="flex-1 w-full min-h-[300px] lg:min-h-[400px] bg-black/20 border border-card-border rounded-xl p-4 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-accent/50 resize-y"
          ></textarea>
        </div>
      </div>

      {error && (
        <div className="mt-8 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg w-full max-w-2xl text-center">
          {error}
        </div>
      )}

      <div className="mt-12">
        <button
          onClick={handleAnalyze}
          disabled={!file || !jdText.trim() || isAnalyzing}
          className="group relative inline-flex items-center gap-2 px-8 py-4 bg-brand-600 hover:bg-brand-500 text-white rounded-full font-bold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Analyzing Fit...
            </>
          ) : (
            <>
              Analyze My Resume
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </div>
    </main>
  );
}

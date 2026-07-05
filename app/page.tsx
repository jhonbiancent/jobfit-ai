'use client';

import { useState, useCallback, useRef } from 'react';
import { Upload, FileText, ArrowRight, Loader2, Zap, Shield, Target, CheckCircle, GripVertical } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Turnstile from '@/components/ui/Turnstile';

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [jdText, setJdText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const router = useRouter();
  const [turnstileKey, setTurnstileKey] = useState(0);
  const jdTextareaRef = useRef<HTMLTextAreaElement>(null);
  const [jdTextareaHeight, setJdTextareaHeight] = useState<number | null>(null);

  const handleTurnstileVerify = useCallback((token: string) => {
    setTurnstileToken(token);
  }, []);

  const handleTurnstileExpire = useCallback(() => {
    setTurnstileToken(null);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleDescriptionResizeStart = useCallback((event: React.PointerEvent<HTMLButtonElement>) => {
    const textarea = jdTextareaRef.current;
    if (!textarea) return;

    event.preventDefault();

    const startY = event.clientY;
    const startHeight = textarea.offsetHeight;
    const minHeight = Number.parseFloat(window.getComputedStyle(textarea).minHeight) || startHeight;

    document.body.style.cursor = 'ns-resize';
    document.body.style.userSelect = 'none';

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const nextHeight = Math.max(minHeight, startHeight + moveEvent.clientY - startY);
      setJdTextareaHeight(nextHeight);
    };

    const handlePointerUp = () => {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      window.removeEventListener('pointermove', handlePointerMove);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp, { once: true });
  }, []);

  const handleAnalyze = async () => {
    if (!file || !jdText.trim()) {
      setError('Please provide both a resume file and a job description.');
      return;
    }

    if (!turnstileToken) {
      setError('Please complete the CAPTCHA verification.');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    const formData = new FormData();
    formData.append('resume', file);
    formData.append('jd', jdText);
    formData.append('turnstileToken', turnstileToken);

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
    } catch (err: unknown) {
      console.error(err);
      const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
      setError(message);
      setTurnstileToken(null);
      setTurnstileKey((k) => k + 1);
      setIsAnalyzing(false);
    }
  };

  const features = [
    {
      icon: <Zap className="w-5 h-5" />,
      title: 'Instant Analysis',
      description: 'Get your ATS compatibility score in seconds.'
    },
    {
      icon: <Target className="w-5 h-5" />,
      title: 'Skill Gap Detection',
      description: 'Find exactly which skills you are missing.'
    },
    {
      icon: <Shield className="w-5 h-5" />,
      title: 'Privacy First',
      description: 'Your resume is never stored on our servers.'
    },
  ];

  return (
    <main className="min-h-full max-w-6xl mx-auto px-6 py-8 md:py-0 md:pb-16 flex flex-col items-center">
      {/* Hero */}
      <div className="text-center mb-14 mt-4 md:mt-8 animate-fade-in-up">
     
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6 tracking-tight leading-tight">
          Is your resume<br className="hidden sm:block" />
          <span className="gradient-text"> JobFit?</span>
        </h1>
        <p className="text-base md:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Upload your resume, paste the job description, and let our AI score your fit,
          flag missing skills, and suggest targeted improvements.
        </p>
      </div>

      {/* Main Input Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 w-full animate-fade-in-up delay-200">
        {/* Resume Upload */}
        <div className="glass-card p-4 md:p-8 flex flex-col lg:col-span-1">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-brand-500/10 border border-brand-500/20 flex items-center justify-center">
              <Upload className="w-4 h-4 text-brand-400" />
            </div>
            Upload Resume
          </h2>
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`flex-1 border-2 border-dashed rounded-xl p-4 md:p-6 flex flex-col items-center justify-center text-center relative min-h-20 lg:min-h-40 transition-all duration-300 ${
              isDragOver
                ? 'border-brand-500 bg-brand-500/5'
                : file
                  ? 'border-green-500/30 bg-green-500/5'
                  : 'upload-zone-idle border-card-border'
            }`}
          >
            <input
              type="file"
              accept=".pdf,.docx,.txt"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            {file ? (
              <div className="flex flex-col items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                  <CheckCircle className="w-7 h-7 text-green-400" />
                </div>
                <div className="text-center">
                  <p className="font-medium text-slate-200 break-all px-2 text-sm">{file.name}</p>
                  <p className="text-xs text-slate-500 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB · Ready</p>
                </div>
              </div>
            ) : (
              <>
                <div className="w-14 h-14 rounded-2xl bg-slate-800/50 border border-white/5 flex items-center justify-center mb-3">
                  <Upload className="w-6 h-6 text-slate-500" />
                </div>
                <p className="font-medium text-slate-300 mb-1 text-sm">
                  Drop your file or <span className="text-brand-400">browse</span>
                </p>
                <p className="text-xs text-slate-600">PDF, DOCX, or TXT · Max 5MB</p>
              </>
            )}
          </div>
        </div>

        {/* Job Description */}
        <div className="glass-card p-6 md:p-8 flex flex-col lg:col-span-2">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center">
              <FileText className="w-4 h-4 text-accent-400" />
            </div>
            Paste Job Description
          </h2>
          <textarea
            ref={jdTextareaRef}
            value={jdText}
            onChange={(e) => setJdText(e.target.value)}
            placeholder="Paste the full job description here..."
            style={jdTextareaHeight ? { height: jdTextareaHeight } : undefined}
            className="block w-full min-h-70 lg:min-h-40 bg-black/20 border border-card-border rounded-xl p-4 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/30 resize-y overflow-auto transition-colors leading-relaxed"
          ></textarea>
          <div className="flex items-center justify-between mt-3 gap-3">
            <p className="text-xs text-slate-600">
              {jdText.length > 0 ? `${jdText.split(/\s+/).filter(Boolean).length} words` : 'Tip: include the full listing for best results'}
            </p>
            <div className="flex justify-center gap-2 items-center">
              <p className='text-xs inline-flex text-brand-400 w-20'>Drag to Resize</p>
                <button
                  type="button"
                  onPointerDown={handleDescriptionResizeStart}
                  aria-label="Resize job description field"
                  title="Drag to resize"
                  className="inline-flex h-7 w-7 shrink-0 cursor-ns-resize items-center justify-center rounded-lg border border-brand-400/10 bg-white/3 text-brand-400 transition hover:border-accent/30 hover:text-slate-300 focus:outline-none focus:ring-2 focus:ring-accent/30"
                >
                  <GripVertical className="w-3.5 h-3.5" />
                </button>
            </div>
          
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mt-8 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl w-full max-w-2xl text-center text-sm animate-fade-in-up">
          {error}
        </div>
      )}

      {/* Turnstile CAPTCHA */}
      <div className="mt-8 animate-fade-in-up delay-300">
        <Turnstile
          key={turnstileKey}
          onVerify={handleTurnstileVerify}
          onExpire={handleTurnstileExpire}
          onError={handleTurnstileExpire}
        />
      </div>

      {/* CTA Button */}
      <div className="mt-6 animate-fade-in-up delay-300">
        <button
          onClick={handleAnalyze}
          disabled={!file || !jdText.trim() || !turnstileToken || isAnalyzing}
          className="btn-glow group relative inline-flex items-center gap-2.5 px-10 py-4 bg-linear-to-r from-brand-600 to-accent text-white rounded-full font-bold text-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-brand-500/20 hover:shadow-brand-500/40 hover:scale-[1.02] active:scale-[0.98]"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              Analyze My Resume
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 w-full mt-20 animate-fade-in-up delay-400">
        {features.map((feature, i) => (
          <div key={i} className="glass-card p-6 text-center group">
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center mx-auto mb-4 text-brand-400 group-hover:text-white group-hover:bg-brand-500/20 group-hover:border-brand-500/20 transition-all">
              {feature.icon}
            </div>
            <h3 className="font-semibold text-slate-200 mb-1">{feature.title}</h3>
            <p className="text-sm text-slate-500 leading-relaxed">{feature.description}</p>
          </div>
        ))}
      </div>
    </main>
  );
}

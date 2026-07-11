'use client';
import { useState, useCallback, useRef } from 'react';
import { Upload, FileText, ArrowRight, Loader2, Zap, Shield, Target, CheckCircle, GripVertical, Check, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Turnstile from '@/components/ui/Turnstile';
import { saveAnalysisCache } from '@/lib/analysis-cache';

export default function Home() {

  const plans = [
  {
    name: 'Quick Check',
    price: '0',
    period: 'forever',
    tagline: 'See where you stand before you apply.',
    icon: <Zap className="w-5 h-5" />,
    features: [
      '3 resume scans per day',
      'Overall ATS match score',
      'Top 5 missing keywords',
      'Basic formatting check',
    ],
    cta: 'Start free',
    highlighted: false,
  },
  {
    name: 'Deep Scan',
    price: '49',
    period: '/month',
    tagline: 'For anyone actively job hunting.',
    icon: <Sparkles className="w-5 h-5" />,
    features: [
      'Unlimited resume scans',
      'Full skill gap breakdown',
      'Tailored improvement suggestions',
      'Save scan history & compare versions',
      'Export annotated report (PDF)',
    ],
    cta: 'Start Deep Scan',
    highlighted: true,
  },
  {
    name: 'Full Audit',
    price: '99',
    period: '/month',
    tagline: 'For career changers and high-volume applicants.',
    icon: <Shield className="w-5 h-5" />,
    features: [
      'Everything in Deep Scan',
      'Cover letter matching',
      'Multi-role comparison (up to 5 JDs)',
      'Recruiter-view formatting audit',
      'Priority analysis queue',
    ],
    cta: 'Start Full Audit',
    highlighted: false,
  },
  ];
  
  const [file, setFile] = useState<File | null>(() => {
    if (typeof window === 'undefined') {
      return null;
    }

    const cachedResumeText = window.sessionStorage.getItem('cachedResumeText');
    if (!cachedResumeText) {
      return null;
    }

    const cachedLabel = window.sessionStorage.getItem('cachedResumeLabel') || 'cached-resume.txt';
    return new File([cachedResumeText], cachedLabel, { type: 'text/plain' });
  });
  const [jdText, setJdText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [analysisStep, setAnalysisStep] = useState<'idle' | 'verifying' | 'extracting' | 'analyzing' | 'done'>('idle');
  const [progress, setProgress] = useState(0);
  const router = useRouter();
  const [turnstileKey, setTurnstileKey] = useState(0);
  const jdTextareaRef = useRef<HTMLTextAreaElement>(null);
  const [jdTextareaHeight, setJdTextareaHeight] = useState<number | null>(null);

  const handleTurnstileVerify = async (token: string) => {
    setTurnstileToken(token);
    
    if (analysisStep === 'verifying') {
      setAnalysisStep('extracting');
      setProgress(30);
      
      // Simulate extraction time for better UX
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setAnalysisStep('analyzing');
      setProgress(60);

      const formData = new FormData();
      formData.append('resume', file!);
      formData.append('jd', jdText);
      formData.append('turnstileToken', token);

      try {
        const response = await fetch('/api/analyze', { method: 'POST', body: formData });
        const result = await response.json();
        
        if (!response.ok) throw new Error(result.error || 'Failed to analyze resume.');
        
        const resumeText = result.data?.resumeText;
        if (typeof resumeText === 'string' && resumeText.trim().length > 0) {
          void saveAnalysisCache({
            resumeText,
            resumeLabel: file!.name,
            resumeMimeType: file!.type || 'application/octet-stream',
            resumeSize: file!.size,
            jobDescription: jdText,
            result: {
              keywordScore: result.data.keywordScore,
              score: result.data.score,
              missingSkills: result.data.missingSkills,
              strongMatches: result.data.strongMatches,
              weaknesses: result.data.weaknesses,
              recommendations: result.data.recommendations,
            },
          }).catch(console.error);
        }

        setProgress(100);
        setAnalysisStep('done');
        sessionStorage.setItem('analysisResult', JSON.stringify(result.data));
        router.push('/dashboard');
      } catch (err: unknown) {
        console.error(err);
        setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
        setAnalysisStep('idle');
        setTurnstileToken(null);
        setTurnstileKey(k => k + 1);
      }
    }
  };

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

  const handleAnalyze = () => {
    if (!file || !jdText.trim()) {
      setError('Please provide both a resume file and a job description.');
      return;
    }
    setError(null);
    setAnalysisStep('verifying');
    setProgress(10);
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
      <div id="analyze" className="text-center mb-14 mt-4 md:mt-8 animate-fade-in-up scroll-mt-28">
        <span className="eyebrow-badge mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
          AI-powered ATS scoring
        </span>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-6 tracking-tight leading-tight text-ink-900">
          Is your resume<br className="hidden sm:block" />
          <span className="gradient-text"> Fit Forda Job?</span>
        </h1>
        <p className="text-base md:text-lg text-ink-500 max-w-2xl mx-auto leading-relaxed">
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
                  <p className="font-medium text-ink-900 break-all px-2 text-sm">{file.name}</p>
                  <p className="text-xs text-ink-500 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB · Ready</p>
                </div>
              </div>
            ) : (
              <>
                <div className="w-14 h-14 rounded-2xl bg-brand-500/20 border border-white/5 flex items-center justify-center mb-3">
                  <Upload className="w-6 h-6 text-brand-500" />
                </div>
                <p className="font-medium text-ink-900 mb-1 text-sm">
                  Drop your file or <span className="text-brand-500">browse</span>
                </p>
                <p className="text-xs text-ink-500">PDF, DOCX, or TXT · Max 5MB</p>
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
            className="block w-full min-h-70 lg:min-h-40  border border-card-border rounded-xl p-4 text-sm text-ink-900 placeholder:text-ink-300 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/30 resize-y overflow-auto transition-colors leading-relaxed"
          ></textarea>
          <div className="flex items-center justify-between mt-3 gap-3">
            <p className="text-xs text-ink-500">
              {jdText.length > 0 ? `${jdText.split(/\s+/).filter(Boolean).length} words` : 'Tip: include the full listing for best results'}
            </p>
            <div className="flex justify-center gap-2 items-center">
              <p className='text-xs inline-flex text-brand-400 w-20'>Drag to Resize</p>
                <button
                  type="button"
                  onPointerDown={handleDescriptionResizeStart}
                  aria-label="Resize job description field"
                  title="Drag to resize"
                  className="inline-flex h-7 w-7 shrink-0 cursor-ns-resize items-center justify-center rounded-lg border border-brand-400/10 bg-white/3 text-brand-400 transition hover:border-accent/30 hover:text-brand-600 focus:outline-none focus:ring-2 focus:ring-accent/30"
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

      {/* CTA Button */}
      <div className="mt-6 animate-fade-in-up delay-300">
        <button
          onClick={handleAnalyze}
          disabled={!file || !jdText.trim() || analysisStep !== 'idle'}
          className="btn-glow btn-primary group relative px-10 py-4 text-lg disabled:cursor-not-allowed"
        >
          Analyze My Resume
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* Trust strip */}
      <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-3 mt-10 text-sm text-ink-500 animate-fade-in-up delay-300">
        <span><strong className="text-ink-900 font-semibold">12,400+</strong> resumes scanned</span>
        <span className="hidden sm:inline w-px h-4 bg-card-border" />
        <span><strong className="text-ink-900 font-semibold">3.2x</strong> more interview callbacks</span>
        <span className="hidden sm:inline w-px h-4 bg-card-border" />
        <span>No signup required to start</span>
      </div>

      {/* How it works */}
      <div id="how-it-works" className="w-full mt-24 md:mt-28 animate-fade-in-up delay-400 scroll-mt-28">
        <div className="text-center mb-12">
          <p className="section-kicker mb-3">How it works</p>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-ink-900">
            Three steps to a stronger application
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 w-full">
          {[
            { step: '01', title: 'Upload your resume', description: 'Drop in a PDF, DOCX, or plain text file — it stays in your session only.' },
            { step: '02', title: 'Paste the job description', description: 'Add the listing you\u2019re applying to so the AI has something to compare against.' },
            { step: '03', title: 'Get your match score', description: 'See your ATS score, missing keywords, and concrete ways to close the gap.' },
          ].map((item) => (
            <div key={item.step} className="glass-card p-6 relative">
              <span className="text-3xl font-extrabold text-brand-500/25 leading-none">{item.step}</span>
              <h3 className="font-semibold text-ink-900 mt-3 mb-1">{item.title}</h3>
              <p className="text-sm text-ink-500 leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Feature Cards */}
      <div id="features" className="w-full mt-24 md:mt-28 animate-fade-in-up delay-400 scroll-mt-28">
        <div className="text-center mb-12">
          <p className="section-kicker mb-3">Why FitFordaJobAI</p>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-ink-900">
            Built for job seekers, not recruiters
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 w-full">
          {features.map((feature, i) => (
            <div key={i} className="glass-card p-6 text-center group">
              <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center mx-auto mb-4 text-brand-400 group-hover:text-white group-hover:bg-brand-500/20 transition-all">
                {feature.icon}
              </div>
              <h3 className="font-semibold text-ink-900 mb-1">{feature.title}</h3>
              <p className="text-sm text-ink-500 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
        {/* Pricing */}
        <div id="pricing" className="w-full mt-24 md:mt-28 animate-fade-in-up delay-500 scroll-mt-28">
          <div className="text-center mb-12">
            <p className="section-kicker mb-3">Pricing</p>
            <h2 className="text-3xl md:text-4xl font-extrabold mb-3 tracking-tight text-ink-900">
              Pick your <span className="gradient-text">scan depth</span>
            </h2>
            <p className="text-ink-500 max-w-xl mx-auto text-sm md:text-base">
              Start with a free check. Upgrade when you need the full picture.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative flex flex-col p-6 md:p-8 rounded-2xl transition-all ${
                  plan.highlighted
                    ? 'glass-card border-2 border-brand-500/40 shadow-xl shadow-brand-500/10 md:-translate-y-3'
                    : 'glass-card border border-card-border'
                }`}
              >
                {plan.highlighted && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-semibold px-3 py-1 rounded-full bg-linear-to-r from-brand-600 to-accent text-white shadow-md">
                    Most popular
                  </span>
                )}

                <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center mb-4 text-brand-400">
                  {plan.icon}
                </div>

                <h3 className="text-lg font-semibold mb-1 text-ink-900">{plan.name}</h3>
                <p className="text-sm text-ink-500 mb-5">{plan.tagline}</p>

                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-3xl font-extrabold text-ink-900">₱{plan.price}</span>
                  <span className="text-sm text-ink-500">{plan.period}</span>
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-ink-700">
                      <Check className="w-4 h-4 text-brand-400 mt-0.5 shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <button
                  type="button"
                  className={`w-full py-3 text-sm ${plan.highlighted ? 'btn-primary' : 'btn-secondary'}`}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>

          <p className="text-center text-xs text-ink-300 mt-8">
            All plans include the same privacy guarantee — resumes are never stored longer than your session.
          </p>
        </div>

        {/* Final CTA banner */}
        <div className="w-full mt-24 md:mt-28 animate-fade-in-up delay-500">
          <div className="glass-card px-6 py-10 md:px-14 md:py-14 text-center flex flex-col items-center">
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-ink-900 mb-3">
              See your match score in under a minute
            </h2>
            <p className="text-ink-500 max-w-md mb-7 text-sm md:text-base">
              No account needed to try it — upload a resume and a job description to get started.
            </p>
            <a href="#analyze" className="btn-primary px-8 py-3.5 text-base">
              Analyze My Resume
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>

      {/* Loading Modal */}
      {analysisStep !== 'idle' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#121c1a] border border-brand-200 dark:border-[#659287]/30 p-8 rounded-3xl shadow-2xl max-w-sm w-full flex flex-col items-center text-center">
            
            {analysisStep === 'verifying' && (
              <>
                <div className="w-14 h-14 rounded-full bg-brand-100 dark:bg-[#659287]/20 flex items-center justify-center mb-5">
                  <Shield className="w-7 h-7 text-brand-600 dark:text-brand-300" />
                </div>
                <h3 className="text-xl font-bold text-brand-900 dark:text-white mb-2">Security Check</h3>
                <p className="text-sm text-brand-400 dark:text-brand-300 mb-6">Please verify you are human to proceed.</p>
                <div className="min-h-16.25">
                  <Turnstile
                    key={turnstileKey}
                    onVerify={handleTurnstileVerify}
                    onExpire={handleTurnstileExpire}
                    onError={handleTurnstileExpire}
                  />
                </div>
                <button 
                  onClick={() => setAnalysisStep('idle')} 
                  className="mt-6 text-sm font-medium text-brand-400 hover:text-brand-600 transition-colors"
                >
                  Cancel
                </button>
              </>
            )}

            {(analysisStep === 'extracting' || analysisStep === 'analyzing' || analysisStep === 'done') && (
              <>
                <div className="relative mb-6 mt-2">
                  <div className="w-16 h-16 rounded-full border-4 border-brand-100 dark:border-[#659287]/20 border-t-brand-500 dark:border-t-brand-300 animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 text-brand-500 dark:text-brand-300 animate-pulse" />
                  </div>
                </div>
                
                <h3 className="text-lg font-bold text-brand-900 dark:text-white mb-2">
                  {analysisStep === 'extracting' && 'Extracting text...'}
                  {analysisStep === 'analyzing' && 'Analyzing resume...'}
                  {analysisStep === 'done' && 'Redirecting...'}
                </h3>
                
                <p className="text-sm text-brand-400 dark:text-brand-300 mb-8">
                  {analysisStep === 'extracting' && 'Reading your document and job description.'}
                  {analysisStep === 'analyzing' && 'Our AI is comparing your skills and experience.'}
                  {analysisStep === 'done' && 'Analysis complete!'}
                </p>

                {/* Progress Bar */}
                <div className="w-full bg-brand-100 dark:bg-[#659287]/20 rounded-full h-2.5 overflow-hidden">
                  <div 
                    className="bg-brand-500 dark:bg-brand-300 h-2.5 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </main>
  );
}

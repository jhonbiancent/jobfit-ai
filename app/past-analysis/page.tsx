'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CalendarClock, Trash2, RotateCcw, FileText, Clock3, Target, Sparkles } from 'lucide-react';
import {
  clearAnalysisCache,
  deleteAnalysisCacheEntry,
  listAnalysisCache,
  type CachedAnalysisRecord,
} from '@/lib/analysis-cache';

export default function PastAnalysisPage() {
  const router = useRouter();
  const [items, setItems] = useState<CachedAnalysisRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const cached = await listAnalysisCache();
        if (mounted) {
          setItems(cached);
          setError(null);
        }
      } catch (err) {
        console.error(err);
        if (mounted) {
          setError('Failed to load cached analyses.');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      mounted = false;
    };
  }, []);

  const openAnalysis = (item: CachedAnalysisRecord) => {
    sessionStorage.setItem('analysisResult', JSON.stringify(item.result));
    router.push('/dashboard');
  };

  const handleReuseResume = (item: CachedAnalysisRecord) => {
    sessionStorage.setItem('cachedResumeText', item.resumeText);
    sessionStorage.setItem('cachedResumeLabel', item.resumeLabel);
    router.push('/');
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteAnalysisCacheEntry(id);
      setItems((current) => current.filter((item) => item.id !== id));
    } catch (err) {
      console.error(err);
      setError('Failed to delete cached analysis.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleClearAll = async () => {
    setDeletingId('all');
    try {
      await clearAnalysisCache();
      setItems([]);
    } catch (err) {
      console.error(err);
      setError('Failed to clear cached analyses.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <main className="min-h-full max-w-6xl mx-auto px-6 py-8 md:py-12">
      <div className="flex items-center justify-between gap-4 mb-8">
        <button
          type="button"
          onClick={() => router.push('/')}
          className="inline-flex items-center gap-2 text-sm text-[var(--muted)] hover:text-brand-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </button>
        <button
          type="button"
          onClick={handleClearAll}
          disabled={!items.length || deletingId === 'all'}
          className="inline-flex items-center gap-2 text-sm text-brand-600 hover:text-brand-900 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Trash2 className="w-4 h-4" />
          Clear All
        </button>
      </div>

      <section className="glass-card p-8 md:p-10 mb-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-brand-600 mb-3">
              <CalendarClock className="w-4 h-4" />
              Cached history
            </p>
            <h1 className="text-3xl md:text-4xl font-bold text-brand-900">Past Analysis</h1>
            <p className="text-[var(--muted)] mt-3 max-w-2xl">
              Reopen your last three analyses, reuse extracted resume text, or clear the local cache when you are done.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-brand-200 bg-brand-50 text-brand-900 text-sm">
            <Clock3 className="w-4 h-4" />
            {items.length} saved
          </div>
        </div>
      </section>

      {error && (
        <div className="mb-6 p-4 rounded-xl border border-red-200 bg-red-50 text-red-700 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="glass-card p-8 text-center text-[var(--muted)]">
          Loading cached analyses...
        </div>
      ) : items.length === 0 ? (
        <div className="glass-card p-8 md:p-10 text-center">
          <Sparkles className="w-10 h-10 mx-auto text-brand-500 mb-4" />
          <h2 className="text-xl font-semibold text-brand-900 mb-2">No cached analyses yet</h2>
          <p className="text-[var(--muted)] max-w-lg mx-auto">
            Your last three analyses will appear here after you run a resume check.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {items.map((item) => (
            <article key={item.id} className="glass-card p-5 md:p-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-brand-50 border border-brand-200 text-brand-900 text-xs">
                      <Target className="w-3.5 h-3.5" />
                      Score {item.result.score}
                    </span>
                    <span className="text-xs text-[var(--muted)]">
                      {new Date(item.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <h2 className="text-lg font-semibold text-brand-900 truncate">{item.resumeLabel}</h2>
                  <p className="text-sm text-[var(--muted)] mt-1 line-clamp-2">
                    {item.jobDescription || 'No job description saved.'}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => openAnalysis(item)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#659287] text-white text-sm font-medium hover:bg-[#4f746b] transition-colors"
                  >
                    <FileText className="w-4 h-4" />
                    Open
                  </button>
                  <button
                    type="button"
                    onClick={() => handleReuseResume(item)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-brand-300 bg-white text-brand-900 text-sm font-medium hover:bg-brand-50 transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Reuse
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleDelete(item.id)}
                    disabled={deletingId === item.id}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-red-200 bg-red-50 text-red-700 text-sm font-medium hover:bg-red-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}

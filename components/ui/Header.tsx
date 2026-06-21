import Link from 'next/link';
import { Sparkles, Briefcase } from 'lucide-react';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-card-border bg-background/80 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center group-hover:bg-brand-500 transition-colors">
            <Briefcase className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">
            JobFit<span className="text-brand-500">AI</span>
          </span>
        </Link>
        <nav className="flex items-center gap-6">
          <Link href="/" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
            Analyzer
          </Link>
          <a href="#" className="text-sm font-medium text-slate-300 hover:text-white transition-colors flex items-center gap-1">
            <Sparkles className="w-4 h-4 text-accent" />
            Premium
          </a>
        </nav>
      </div>
    </header>
  );
}

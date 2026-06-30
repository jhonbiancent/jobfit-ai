import Link from 'next/link';
import { Briefcase, Mail } from 'lucide-react';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full  bg-(--background)/80 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-linear-to-br from-brand-500 to-accent flex items-center justify-center shadow-lg shadow-brand-500/20 group-hover:shadow-brand-500/40 transition-shadow">
            <Briefcase className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">
            JobFit<span className="gradient-text">AI</span>
          </span>
        </Link>
        <nav className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="text-sm font-medium text-slate-400 hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-white/5"
          >
            Analysis
          </Link>
       
        </nav>
      </div>
    </header>
  );
}

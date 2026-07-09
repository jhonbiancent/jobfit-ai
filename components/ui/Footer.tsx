import { Heart, Briefcase } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="w-full border-t border-brand-200 mt-auto">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Brand */}
          <div className="flex flex-col items-center md:items-start gap-2">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-linear-to-br from-brand-500 to-accent flex items-center justify-center">
                <Briefcase className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold tracking-tight">
                FitFordaJob<span className="gradient-text">AI</span>
              </span>
            </Link>
            <p className="text-xs text-brand-400 max-w-xs text-center md:text-left">
              AI-powered resume analysis to help you land your dream job.
            </p>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6 text-sm text-slate-600">
            <Link href="/" className="hover:text-brand-600 transition-colors">Creator: Jhon Biancent Recede</Link>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 pt-6 border-t border-brand-100 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-xs text-brand-400">
            © {new Date().getFullYear()} FitFordaJob AI. All rights reserved.
          </p>
          <div className="flex items-center gap-1 text-xs text-brand-400">
            Built with <Heart className="w-3 h-3 mx-0.5" fill="currentColor" /> to beat the ATS.
          </div>
        </div>
      </div>
    </footer>
  );
}

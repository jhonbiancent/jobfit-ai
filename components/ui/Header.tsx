import Link from 'next/link';
import { Briefcase, Sparkles, ChevronRight } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

export default function Header() {
  return (
    <header className="sticky top-4 z-50 w-full max-w-6xl mx-auto px-4 sm:px-6">
      <div className="h-16 flex items-center justify-between px-4 sm:px-5 bg-[#263f3a]/90 backdrop-blur-lg border border-[#659287]/30 rounded-2xl shadow-2xl shadow-[#263f3a]/20 transition-all duration-300 hover:border-[#659287]/50 hover:shadow-[#263f3a]/30">
        
        {/* Logo Section */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-linear-to-br from-[#659287] to-[#4f746b] flex items-center justify-center shadow-lg shadow-[#659287]/20 group-hover:scale-105 transition-transform duration-300 ease-out">
            <Briefcase className="w-5 h-5 text-white group-hover:-rotate-12 transition-transform duration-300 ease-out" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">
            JobFit<span className="text-[#b1d3b9]">AI</span>
          </span>
        </Link>
        
        {/* Navigation Section */}
        <nav className="flex items-center gap-2 sm:gap-4">
          <Link
            href="/past-analysis"
            className="hidden sm:flex text-sm font-medium text-[#d3e6cd] hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-white/10"
          >
            Past Analysis
          </Link>
          
          <ThemeToggle />
          
          {/* CTA Button */}
          <Link
            href="/"
            className="group relative inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#659287] hover:bg-[#4f746b] text-white rounded-xl font-medium text-sm transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-[#659287]/25 active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-[#e6f2dd]" />
            <span>Score Resume</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-300" />
          </Link>
        </nav>
      </div>
    </header>
  );
}

import Link from 'next/link';
import Image from 'next/image';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

export default function Header() {
  return (
    <header className="sticky top-4 z-50 w-full max-w-6xl mx-auto px-4 sm:px-6">
      <div className="h-16 flex items-center justify-between px-4 sm:px-5 bg-[#263f3a]/90 backdrop-blur-lg border border-[#659287]/30 rounded-2xl shadow-2xl shadow-[#263f3a]/20 transition-all duration-300 hover:border-[#659287]/50 hover:shadow-[#263f3a]/30">
        
        {/* Logo Section */}
        <Link href="/" className="flex items-center gap-3 group">
          <Image 
            src="/fitfordajob-logo.png" 
            alt="FitFordaJob Logo" 
            width={40} 
            height={40} 
            className="w-10 h-10 group-hover:scale-105 transition-transform duration-300 ease-out object-contain" 
            priority
          />
          <span className="text-xl font-bold tracking-tight text-white">
            FitFordaJob<span className="text-[#b1d3b9]">AI</span>
          </span>
        </Link>
        
        {/* Navigation Section */}
        <nav className="flex items-center gap-2 sm:gap-4">
          <Link
            href="/past-analysis"
            className="flex text-sm font-medium text-[#d3e6cd] hover:text-white transition-colors px-2 sm:px-3 py-2 rounded-lg hover:bg-white/10"
          >
            Past Analysis
          </Link>
          
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}

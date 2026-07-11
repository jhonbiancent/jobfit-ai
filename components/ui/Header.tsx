'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

const navLinks = [
  { href: '/#how-it-works', label: 'How it works' },
  { href: '/#features', label: 'Features' },
  { href: '/#pricing', label: 'Pricing' },
  { href: '/past-analysis', label: 'Past Analysis' },
];

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-4 z-50 w-full max-w-6xl mx-auto px-4 sm:px-6">
      <div className="flex items-center justify-between h-16 px-4 sm:px-5 bg-[var(--nav-surface)]/95 backdrop-blur-lg border border-[var(--nav-border)] rounded-2xl shadow-2xl shadow-black/10 transition-all duration-300">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group shrink-0">
          <Image
            src="/fitfordajob-logo.png"
            alt="FitFordaJob Logo"
            width={40}
            height={40}
            className="w-9 h-9 sm:w-10 sm:h-10 group-hover:scale-105 transition-transform duration-300 ease-out object-contain"
            priority
          />
          <span className="text-lg sm:text-xl font-bold tracking-tight text-white">
            FitFordaJob<span className="text-[#b1d3b9]">AI</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-[#d3e6cd]/90 hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-white/10"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right side: CTA + theme toggle + mobile trigger */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/#analyze"
            className="hidden sm:inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold text-white bg-linear-to-r from-brand-600 to-accent shadow-md shadow-black/20 hover:shadow-black/30 hover:scale-[1.03] transition-all"
          >
            Get Started
          </Link>
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            className="md:hidden inline-flex items-center justify-center w-9 h-9 rounded-lg text-[#d3e6cd] hover:bg-white/10 transition-colors"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden mt-2 p-3 bg-[var(--nav-surface)]/95 backdrop-blur-lg border border-[var(--nav-border)] rounded-2xl shadow-2xl shadow-black/10 flex flex-col gap-1 animate-fade-in-up">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="text-sm font-medium text-[#d3e6cd]/90 hover:text-white transition-colors px-3 py-2.5 rounded-lg hover:bg-white/10"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/#analyze"
            onClick={() => setOpen(false)}
            className="mt-1 inline-flex items-center justify-center px-4 py-2.5 rounded-full text-sm font-semibold text-white bg-linear-to-r from-brand-600 to-accent"
          >
            Get Started
          </Link>
        </div>
      )}
    </header>
  );
}

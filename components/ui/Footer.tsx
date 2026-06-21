import { Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full border-t border-card-border mt-auto">
      <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-sm text-slate-500">
          © {new Date().getFullYear()} JobFit AI. All rights reserved.
        </p>
        <div className="flex items-center gap-1 text-sm text-slate-500">
          Built with <Heart className="w-4 h-4 text-red-500 mx-1" fill="currentColor" /> to beat the ATS.
        </div>
      </div>
    </footer>
  );
}

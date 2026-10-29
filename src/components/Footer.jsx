import React from 'react';
import { useConfig } from '../config/ConfigContext';
import { Heart, Sliders, ArrowUp } from 'lucide-react';
import { reveal } from '../reveal';

export default function Footer() {
  const { config, isAdmin, setIsStudioOpen } = useConfig();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#121013] text-stone-400 py-12 px-6 border-t border-stone-800 text-xs">
      <div ref={reveal()} className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
        
        {/* Left: Branding & Recipient tribute */}
        <div className="flex flex-col items-center sm:items-start gap-1">
          <div className="flex items-center gap-2 text-stone-200 font-royal italic font-semibold text-lg">
            <span>Special Celebration For {config.hero?.recipientName || "Sana"}</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 animate-pulse" />
          </div>
          <p className="text-stone-500 text-[11px] tracking-wide">
            {config.footer?.madeWithLoveBy || "Crafted with love for your special day"} • {config.footer?.year || "2026"}
          </p>
        </div>

        {/* Center / Right: Quick Navigation & Seller Studio Shortcut */}
        <div className="flex items-center gap-4">
          {isAdmin && (<>
          <button
            onClick={() => setIsStudioOpen(true)}
            className="flex items-center gap-1.5 text-amber-400 hover:text-amber-300 transition-colors font-medium"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Customize for a New Client</span>
          </button>

          <span className="text-stone-700">|</span>
          </>)}

          <button
            onClick={scrollToTop}
            className="flex items-center gap-1.5 text-stone-400 hover:text-stone-200 transition-colors"
          >
            <span>Back to Top</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </footer>
  );
}

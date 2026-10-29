import React, { useState, useEffect, useRef } from 'react';
import { useConfig } from '../config/ConfigContext';
import confetti from 'canvas-confetti';
import { Heart, Sparkles, ArrowDown, Play, Pause } from 'lucide-react';

export default function RibbonSpiralHero() {
  const { config, updateConfig, isAdmin, isAudioPlaying, setIsAudioPlaying } = useConfig();
  const [activePhoto, setActivePhoto] = useState(null);
  const [isPaused, setIsPaused] = useState(false); // always starts moving; visitors can pause it

  const pathRef = useRef(null);
  const animFrameRef = useRef(null);
  const offsetRef = useRef(0);
  const speedRef = useRef(0.55); // Smooth cinematic ribbon glide
  const cardRefs = useRef([]);
  const hoveredRef = useRef(null);
  const introStartRef = useRef(null);

  const ribbonPhotos = config.hero?.ribbonPhotos || [];

  // 24 evenly-spaced film slides along the ribbon loop
  const itemsCount = 24;

  // Esc closes the lightbox
  useEffect(() => {
    if (!activePhoto) return;
    const onKey = (e) => e.key === 'Escape' && setActivePhoto(null);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [activePhoto]);

  // Exact Ribbon Loop (🎗️) Path in a 1600 x 900 coordinate system matching Screenshot 1:
  // 1. Entry: starts at bottom-left (-80, 735) and runs right beneath the text block to (560, 700)
  // 2. Loop Upward: climbs smoothly from (560, 700) up to the apex at (780, 130)
  // 3. Loop Arch & Descent: rounds top of loop (840, 130) and swoops down on the right to (700, 610), crossing over the entry
  // 4. Exit Wave: curves down-right to (830, 660) and sweeps gently up across the right to (1700, 240)
  const pathD = `
    M -80 735
    C 160 740, 380 730, 560 700
    C 660 680, 710 540, 705 400
    C 700 250, 730 130, 800 130
    C 870 130, 915 220, 895 360
    C 870 500, 790 575, 715 620
    C 655 655, 745 670, 830 660
    C 990 645, 1150 580, 1300 490
    C 1440 405, 1560 320, 1720 230
  `;

  useEffect(() => {
    const pathEl = pathRef.current;
    if (!pathEl) return;

    let totalLength = 0;
    try {
      totalLength = pathEl.getTotalLength();
    } catch (e) {
      totalLength = 2600;
    }

    const spacing = totalLength / itemsCount;
    let lastTime = performance.now();
    const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

    const animate = (time) => {
      const dt = (time - lastTime) / 16.67; // Normalize to 60fps
      lastTime = time;

      // Opening shot: the ribbon whips in fast and eases down to its cruising glide over ~2.8s
      introStartRef.current ??= time;
      const sinceIntro = reduceMotion ? Infinity : time - introStartRef.current;
      const boost = 14 * Math.max(0, 1 - sinceIntro / 2800) ** 3;

      if (!isPaused) {
        offsetRef.current = (offsetRef.current + (speedRef.current + boost) * dt) % totalLength;
      }

      for (let i = 0; i < itemsCount; i++) {
        const el = cardRefs.current[i];
        if (!el) continue;
        const dist = (offsetRef.current + i * spacing) % totalLength;
        const p1 = pathEl.getPointAtLength(dist);
        
        // Calculate tangent vector for natural rotation along the curve
        const nextDist = (dist + 3) % totalLength;
        const p2 = pathEl.getPointAtLength(nextDist);
        const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x) * (180 / Math.PI);

        // Proper 3D Ribbon folding depth:
        // Entry strand: z=10
        // Left loop going up: z=15
        // Loop apex: z=18
        // Right loop coming down (crosses IN FRONT of the left strand): z=30
        // Exit strand: z=20
        let zIndex = 12;
        if (p1.x > 500 && p1.x < 780 && p1.y < 550) {
          zIndex = 16; // Ascending left side of loop
        } else if (p1.x >= 750 && p1.x <= 930 && p1.y < 450) {
          zIndex = 22; // Loop top & descending upper
        } else if (p1.x > 670 && p1.x < 800 && p1.y >= 550 && p1.y <= 650) {
          zIndex = 35; // Front crossover fold!
        } else if (p1.x >= 800) {
          zIndex = 20; // Exit strand
        }

        // Convert 1600x900 coordinate system to percentage
        const left = (p1.x / 1600) * 100;
        const top = (p1.y / 900) * 100;

        // Write straight to the DOM: no React re-render per frame
        el.style.display = left < -10 || left > 110 ? 'none' : '';
        el.style.left = `${left}%`;
        el.style.top = `${top}%`;
        el.style.transform = `translate(-50%, -50%) rotate(${angle}deg)`;
        el.style.zIndex = hoveredRef.current === i ? 60 : zIndex;
        el.style.opacity = Math.min(1, Math.max(0, (sinceIntro - 500 - i * 40) / 500)); // cards fade in one after another
      }

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [itemsCount, isPaused]);

  const handleHeartClick = () => {
    setIsAudioPlaying(!isAudioPlaying);
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { x: 0.1, y: 0.9 },
      colors: ['#e11d48', '#d4af37', '#ec4899', '#f59e0b']
    });
  };

  return (
    <section 
      id="hero" 
      className="relative min-h-screen w-full bg-[#f4f2ec] overflow-hidden flex flex-col justify-between pt-16 pb-8 px-6 md:px-14 select-none"
      // Mouse position as -1..1 in --mx/--my, for the text/ribbon parallax
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        e.currentTarget.style.setProperty('--mx', (((e.clientX - r.left) / r.width) * 2 - 1).toFixed(3));
        e.currentTarget.style.setProperty('--my', (((e.clientY - r.top) / r.height) * 2 - 1).toFixed(3));
      }}
    >
      {/* Hidden SVG curve measurement element */}
      <svg className="absolute w-0 h-0 pointer-events-none opacity-0" viewBox="0 0 1600 900">
        <path ref={pathRef} d={pathD} fill="none" />
      </svg>

      {/* Subtle luxury paper texture */}
      <div className="absolute inset-0 bg-[radial-gradient(#e5dfd2_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />

      {/* Drifting warm light leak, like sun through a projector gate */}
      <div className="hero-light-leak absolute -top-1/4 -left-1/4 w-[80%] h-[80%] rounded-full bg-[radial-gradient(circle,rgba(255,186,102,0.4),transparent_65%)] blur-3xl pointer-events-none" />

      {/* Film grain + vignette over everything */}
      <div className="absolute film-grain-anim opacity-[0.06] mix-blend-multiply pointer-events-none z-[45]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(41,29,12,0.16))] pointer-events-none z-[45]" />

      {/* Opening shutter: screen starts black and opens from the middle */}
      <div className="hero-shutter absolute inset-x-0 top-0 h-1/2 bg-[#0c0a09] origin-top pointer-events-none z-[70]" />
      <div className="hero-shutter absolute inset-x-0 bottom-0 h-1/2 bg-[#0c0a09] origin-bottom pointer-events-none z-[70]" />

      {/* Top Left: Date Badge matching Screenshot 1 */}
      <div className="relative z-30 pt-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="w-8 h-px bg-amber-500/70" />
          <span className="font-sans text-[11px] font-semibold uppercase tracking-[0.35em] text-stone-500">
            {config.birthDateLabel || "OCT 2"}
          </span>
        </div>

        {/* Ribbon Track Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/70 hover:bg-white text-stone-600 border border-stone-200 text-[11px] font-mono shadow-sm transition-all"
            title={isPaused ? "Resume Ribbon Track" : "Pause Ribbon Track"}
          >
            {isPaused ? <Play className="w-3 h-3 text-emerald-600" /> : <Pause className="w-3 h-3 text-stone-500" />}
            <span className="hidden sm:inline">{isPaused ? "Resume Ribbon" : "Pause Ribbon"}</span>
          </button>
        </div>
      </div>

      {/* FULL-WIDTH RIBBON CANVAS (Covers entire screen to form proper ribbon shape 🎗️)
          Phones: sits below the text at the path's true 16:9 shape, 200vw wide so the loop is centred */}
      <div
        className="relative max-md:order-1 max-md:self-center max-md:w-[200vw] max-md:aspect-video max-md:-my-12 md:absolute md:inset-0 pointer-events-auto overflow-hidden [translate:calc(var(--mx,0)*-14px)_calc(var(--my,0)*-10px)] transition-[translate] duration-700 ease-out motion-reduce:[translate:none]"
        onMouseEnter={() => { speedRef.current = 0.25; }} // Gently slow on hover
        onMouseLeave={() => { speedRef.current = 0.55; }} // Resume normal speed
      >
        {/* Faint subtle filmstrip guide tape */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-15" viewBox="0 0 1600 900" preserveAspectRatio="none">
          <path d={pathD} fill="none" stroke="#b8860b" strokeWidth="8" strokeDasharray="16 10" />
        </svg>

        {/* 24 Cards gliding smoothly along the proper ribbon loop */}
        {ribbonPhotos.length > 0 && Array.from({ length: itemsCount }, (_, idx) => {
          const photo = ribbonPhotos[idx % ribbonPhotos.length];

          return (
            <div
              key={idx}
              ref={(el) => { cardRefs.current[idx] = el; }}
              onMouseEnter={() => { hoveredRef.current = idx; }}
              onMouseLeave={() => { hoveredRef.current = null; }}
              onClick={(e) => {
                const r = e.currentTarget.getBoundingClientRect();
                setActivePhoto(photo);
                confetti({ particleCount: 30, origin: { x: (r.left + r.width / 2) / innerWidth, y: (r.top + r.height / 2) / innerHeight } });
              }}
              style={{ display: 'none' }}
              className="absolute cursor-pointer group will-change-transform"
            >
              {/* Film slide card: B&W at rest, full colour + lift on hover */}
              <div className="p-1 sm:p-1.5 bg-white shadow-[0_4px_12px_rgba(0,0,0,0.12)] rounded-[2px] border border-stone-200/90 grayscale transition-all duration-300 ease-out group-hover:grayscale-0 group-hover:scale-[1.4] group-hover:ring-2 group-hover:ring-amber-400 group-hover:shadow-2xl">
                <img
                  src={photo?.url}
                  alt={photo?.alt || `Memory ${idx}`}
                  className="w-14 h-16 sm:w-16 sm:h-20 md:w-20 md:h-24 lg:w-[82px] lg:h-[98px] object-cover rounded-[1px] block pointer-events-none"
                  draggable={false}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Left Hero Typography Content Area (Floating over the ribbon with high z-index) */}
      <div className="hero-scroll-out relative z-20 max-w-xl my-auto pointer-events-none pt-4 pb-16 [translate:calc(var(--mx,0)*8px)_calc(var(--my,0)*6px)] transition-[translate] duration-700 ease-out motion-reduce:[translate:none] [&>*]:animate-fade-up motion-reduce:[&>*]:animate-none [&>*:nth-child(2)]:[animation-delay:900ms] [&>*:nth-child(3)]:[animation-delay:1200ms] [&>*:nth-child(4)]:[animation-delay:1400ms] [&>*:nth-child(5)]:[animation-delay:1600ms]">
        
        {/* Luxury Typography Eyebrow with Font Switcher (owner only) */}
        {isAdmin && (
        <div className="pointer-events-auto inline-flex items-center gap-2 mb-3 px-3 py-1 rounded-full bg-white/70 backdrop-blur-md border border-stone-200/80 shadow-sm text-xs">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span className="font-mono text-[10px] text-stone-500 uppercase tracking-widest font-semibold">Style:</span>
          <select
            value={config.hero?.fontTheme || 'royal-garamond'}
            onChange={(e) => {
              const updated = {
                ...config,
                hero: {
                  ...config.hero,
                  fontTheme: e.target.value
                }
              };
              updateConfig(updated);
            }}
            className="bg-transparent text-stone-800 font-bold text-xs cursor-pointer outline-none border-none py-0 pr-1"
          >
            <option value="syne-couture">Couture Sculpted (Syne)</option>
            <option value="vogue-editorial">Vogue Haute Couture (Italiana & Bodoni)</option>
            <option value="royal-garamond">Royal Palace (Cormorant Garamond)</option>
            <option value="paris-romance">Paris Romance (Script & Serif)</option>
          </select>
        </div>
        )}

        {/* Hero Title Matching Screenshot 1 with True Luxury Typography */}
        {config.hero?.fontTheme === 'vogue-editorial' ? (
          /* Style 1: Vogue Haute Couture (Italiana & Bodoni Moda) */
          <h1 className="hero-title tracking-tight leading-[0.92]">
            <span className="block text-5xl sm:text-6xl md:text-7xl lg:text-[76px] font-luxury font-bold text-stone-900 tracking-[0.06em] uppercase">
              {config.hero?.titlePrefix || "Happy"}
            </span>
            <span className="block text-5xl sm:text-6xl md:text-7xl lg:text-[76px] font-couture italic font-bold text-stone-900 tracking-[-0.02em] mt-1">
              {config.hero?.titleMain || "Birthday"}
            </span>
            <span className="block text-6xl sm:text-7xl md:text-8xl lg:text-[90px] font-luxury font-bold tracking-tight mt-2">
              <span 
                className="inline-block gold-shimmer-text gold-aura-glow"
                style={{ color: config.hero?.highlightColor || "#d99b26" }}
              >
                {config.hero?.recipientName || "Sana"}
              </span>
            </span>
          </h1>
        ) : (config.hero?.fontTheme || 'royal-garamond') === 'royal-garamond' ? (
          /* Style 2: Royal Palace (Cormorant Garamond & Playfair) */
          <h1 className="hero-title tracking-tight leading-[0.95]">
            <span className="block text-5xl sm:text-6xl md:text-7xl lg:text-[78px] font-royal font-light text-stone-900 tracking-wide uppercase">
              {config.hero?.titlePrefix || "Happy"}
            </span>
            <span className="block text-5xl sm:text-6xl md:text-7xl lg:text-[78px] font-royal italic font-bold text-stone-900 tracking-tight mt-0.5">
              {config.hero?.titleMain || "Birthday"}
            </span>
            <span className="block text-6xl sm:text-7xl md:text-8xl lg:text-[92px] font-royal italic font-bold tracking-normal mt-1">
              <span 
                className="inline-block gold-shimmer-text gold-aura-glow"
                style={{ color: config.hero?.highlightColor || "#d99b26" }}
              >
                {config.hero?.recipientName || "Sana"}
              </span>
            </span>
          </h1>
        ) : config.hero?.fontTheme === 'paris-romance' ? (
          /* Style 3: Paris Romance (Cinzel & Alex Brush Script) */
          <h1 className="hero-title tracking-tight leading-[1]">
            <span className="block text-4xl sm:text-5xl md:text-6xl font-display font-bold text-stone-900 tracking-[0.12em] uppercase">
              {config.hero?.titlePrefix || "Happy"}
            </span>
            <span className="block text-6xl sm:text-7xl md:text-8xl font-script text-stone-800 -my-2 tracking-normal">
              {config.hero?.titleMain || "Birthday"}
            </span>
            <span className="block text-6xl sm:text-7xl md:text-8xl font-display font-black tracking-tight mt-2">
              <span 
                className="inline-block gold-shimmer-text gold-aura-glow"
                style={{ color: config.hero?.highlightColor || "#d99b26" }}
              >
                {config.hero?.recipientName || "Sana"}
              </span>
            </span>
          </h1>
        ) : (
          /* Default: Couture Sculpted Syne (Exact match to Screenshot 1!) */
          <h1 className="hero-title tracking-tight leading-[0.94]">
            <span className="block text-5xl sm:text-6xl md:text-7xl lg:text-[80px] font-syne font-extrabold text-stone-950 tracking-[-0.035em]">
              {config.hero?.titlePrefix || "Happy"}
            </span>
            <span className="block text-5xl sm:text-6xl md:text-7xl lg:text-[80px] font-syne font-extrabold text-stone-950 tracking-[-0.035em] mt-0.5">
              {config.hero?.titleMain || "Birthday"}
            </span>
            
            {/* Recipient Name in Mustard Gold with Syne sculpted curves + Luxury Shimmer */}
            <span className="block text-6xl sm:text-7xl md:text-8xl lg:text-[92px] font-syne font-black tracking-[-0.025em] mt-1.5">
              <span 
                className="inline-block gold-shimmer-text gold-aura-glow drop-shadow-[0_4px_16px_rgba(217,155,38,0.25)]"
                style={{ color: config.hero?.highlightColor || "#d99b26" }}
              >
                {config.hero?.recipientName || "Sana"}
              </span>
            </span>
          </h1>
        )}

        {/* Elegant Underline Divider */}
        <div className="w-16 h-[2px] bg-gradient-to-r from-amber-500/80 to-stone-300 my-6"></div>

        {/* Heartfelt Paragraph Message */}
        <p className="text-stone-600 text-sm sm:text-base leading-relaxed font-normal max-w-md pointer-events-auto">
          {config.hero?.message || "wishing you a day filled with love, laughter, and all the happiness your heart can hold. May this year bring you endless joy and unforgettable memories. Happy Birthday!"}
        </p>

        {/* Explore Gallery Button (solid pill so it stays legible over passing photos) */}
        <div className="mt-8 pointer-events-auto flex items-center gap-4">
          <a 
            href="#memories" 
            className="inline-flex items-center gap-2.5 pl-5 pr-4 py-2.5 rounded-full bg-stone-900 text-[#f4f2ec] text-xs font-bold tracking-[0.18em] uppercase shadow-[0_8px_24px_-8px_rgba(28,25,23,0.5)] hover:bg-amber-600 hover:shadow-[0_10px_28px_-8px_rgba(217,119,6,0.6)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500 transition-all group"
          >
            <span>Explore Gallery</span>
            <ArrowDown className="w-3.5 h-3.5 group-hover:translate-y-0.5 transition-transform" />
          </a>
        </div>
      </div>

      {/* Bottom Bar: Heart button & "MADE FOR YOU" matching Screenshot 1 */}
      <div className="relative z-30 max-md:order-2 flex items-center justify-between pt-6 border-t border-stone-200/60 mt-4 pointer-events-auto">
        {/* Heart Interactive Button */}
        <button
          onClick={handleHeartClick}
          className="flex items-center gap-2 group cursor-pointer focus:outline-none"
          title="Click to send love & play music"
        >
          <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-500 shadow-sm group-hover:scale-125 group-hover:bg-rose-500 group-hover:text-white transition-all duration-300">
            <Heart className="w-4 h-4 fill-current animate-pulse" />
          </div>
          <span className="font-sans text-[11px] font-semibold uppercase tracking-[0.25em] text-stone-500 group-hover:text-stone-800 transition-colors">
            CLICK ME
          </span>
        </button>

        {/* Subtle ribbon motion hint */}
        <div className="hidden md:flex items-center gap-2 text-[11px] font-mono text-stone-400">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
          <span>Hover to slow the ribbon • Tap any photo to enlarge</span>
        </div>

        {/* Made for you label */}
        <div className="text-[10px] md:text-xs font-mono tracking-[0.25em] text-stone-400 uppercase font-medium">
          {config.tagline || "MADE FOR YOU"}
        </div>
      </div>

      {/* Photo Lightbox Modal on click */}
      {activePhoto && (
        <div 
          onClick={() => setActivePhoto(null)} 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
        >
          <div 
            onClick={(e) => e.stopPropagation()} 
            className="bg-white p-5 max-w-md w-full rounded-2xl shadow-2xl relative animate-in fade-in zoom-in-95 duration-200 border border-stone-100"
          >
            <div className="aspect-[4/5] overflow-hidden rounded-xl bg-stone-100">
              <img 
                src={activePhoto.url} 
                alt={activePhoto.alt || "Memory detail"} 
                className="w-full h-full object-cover rounded-xl" 
              />
            </div>
            <div className="mt-4 flex justify-between items-center">
              <div>
                <p className="text-stone-900 font-royal italic text-2xl font-semibold">Cherished Memory ✨</p>
                <p className="text-xs text-stone-500">Captured with love</p>
              </div>
              <button 
                onClick={() => setActivePhoto(null)} 
                className="px-3 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-full text-xs font-bold font-mono transition-colors"
              >
                Close ✕
              </button>
            </div>
          </div>
        </div>
      )}

    </section>
  );
}

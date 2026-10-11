import React, { useState, useEffect } from 'react';
import { useConfig } from '../config/ConfigContext';
import confetti from 'canvas-confetti';

// Pinned polaroid board. Desktop: two staggered rows, each card absolutely placed in % of a 10:7.9 board.
// Mobile: the same cards flow into a two-column grid.
// ponytail: 8 hand-placed slots; extra photos beyond 8 only show on mobile.
const SLOTS = [
  { l: 2,  t: 4,  rot: -3 },
  { l: 26, t: 0,  rot: 2.5 },
  { l: 51, t: 5,  rot: -2 },
  { l: 75, t: 1,  rot: 3 },
  { l: 8,  t: 53, rot: 2 },
  { l: 32, t: 56, rot: -3 },
  { l: 56, t: 53, rot: 3 },
  { l: 78, t: 55, rot: -2.5 },
];

// Glossy push-pin colours: red, yellow, blue
const PINS = ['#e3172b', '#f6c500', '#1aa3ea'];

// Aged polaroid paper: fine grey speckle + soft top-to-bottom shading
const PAPER = {
  backgroundColor: '#f2ede2',
  backgroundImage:
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0.35 0 0 0 0 0.32 0 0 0 0 0.27 1.4 0 0 0 -0.75'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\"), linear-gradient(to bottom, rgba(255,255,255,0.55), rgba(120,100,70,0.08))",
};

// Section background: clean warm off-white paper (like a magazine page), faint grain,
// a warm glow under the fairy lights and softly shaded edges.
const BOARD_BG = {
  backgroundColor: '#f6f3ed',
  backgroundImage: [
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0.4 0 0 0 0 0.36 0 0 0 0 0.3 1.2 0 0 0 -0.78'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
    'radial-gradient(ellipse 90% 340px at 50% 0%, rgba(255, 205, 120, 0.28), transparent 70%)',
    'radial-gradient(ellipse at 50% 45%, transparent 55%, rgba(140, 115, 80, 0.12) 100%)',
  ].join(', '),
};

const DEFAULT_LINES = [
  'Born to light up every room.',
  'Brilliantly smart and impossibly kind.',
  'Can make just anyone laugh.',
  'Is always positive about the future.',
  'Loves deeply, laughs loudly.',
  'Will definitely turn out to be extraordinary.',
];

const Pin = ({ color, className = '' }) => (
  <span
    aria-hidden="true"
    className={`absolute z-20 left-1/2 -translate-x-1/2 rounded-full shadow-[0_3px_4px_rgba(0,0,0,0.35)] ${className}`}
    style={{ background: `radial-gradient(circle at 35% 30%, rgba(255,255,255,0.75), ${color} 35%, ${color})` }}
  />
);

// A drooping string of fairy lights. Wire is `swags` quadratic curves; bulbs sit exactly on it
// (quadratic with mid control at 2*sag => y = 4*sag*t*(1-t)). x in %, y in px.
const FairyLights = ({ swags, sag, top, count, offset = 0 }) => {
  const d = Array.from({ length: swags }, (_, i) => {
    const x0 = (i * 100) / swags;
    const x1 = ((i + 1) * 100) / swags;
    return `${i === 0 ? `M ${x0} 0 ` : ''}Q ${(x0 + x1) / 2} ${2 * sag} ${x1} 0`;
  }).join(' ');

  return (
    <div aria-hidden="true" className="absolute inset-x-0 pointer-events-none z-10" style={{ top }}>
      <svg className="w-full overflow-visible" style={{ height: sag }} viewBox={`0 0 100 ${sag}`} preserveAspectRatio="none">
        <path d={d} fill="none" stroke="#4a4237" strokeOpacity="0.7" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
      </svg>
      {Array.from({ length: count }, (_, k) => {
        const u = (k + 0.5) / count;
        const t = u * swags - Math.floor(u * swags);
        return (
          <span
            key={k}
            className="absolute -translate-x-1/2 flex flex-col items-center"
            style={{ left: `${u * 100}%`, top: 4 * sag * t * (1 - t) - 1 }}
          >
            <span className="w-1 h-1.5 bg-[#4a4237] rounded-[1px]" />
            {/* Opacity-only blink (no movement), so it stays on even with reduced-motion */}
            <span
              className="w-2 h-2.5 sm:w-2.5 sm:h-3 rounded-full bg-[#fff3c4] animate-blink shadow-[0_0_6px_2px_rgba(255,214,120,0.95),0_0_18px_7px_rgba(255,180,60,0.5)]"
              style={{ animationDelay: `${((k * 0.37 + offset) % 2.4).toFixed(2)}s`, animationDuration: `${1.6 + ((k * 0.53) % 1.4)}s` }}
            />
          </span>
        );
      })}
    </div>
  );
};

export default function PolaroidGallery() {
  const { config } = useConfig();
  const photos = config.polaroids || [];
  const name = config.hero?.recipientName || config.clientName || 'You';
  const board = config.memoryBoard || {};
  const lines = board.lines?.length ? board.lines : DEFAULT_LINES;
  const [selected, setSelected] = useState(null);

  // Esc closes the note
  useEffect(() => {
    if (!selected) return;
    const onKey = (e) => e.key === 'Escape' && setSelected(null);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selected]);

  const open = (photo, idx, e) => {
    setSelected({ ...photo, pin: PINS[idx % PINS.length] });
    confetti({
      particleCount: 25,
      spread: 45,
      origin: { x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight },
      colors: [...PINS, '#b08a3e'],
    });
  };

  return (
    <section id="memories" style={BOARD_BG} className="relative w-full overflow-hidden pt-32 pb-20 sm:pt-36 sm:pb-28 px-5 sm:px-8">
      {/* Two crossing strands of fairy lights across the top */}
      <FairyLights swags={3} sag={46} top={30} count={27} />
      <FairyLights swags={4} sag={30} top={50} count={28} offset={1.1} />

      {/* "A person who is ___" masthead */}
      <header className="relative text-center text-stone-900 max-w-3xl mx-auto mb-10 md:mb-6">
        <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.35em] text-stone-500">{board.heading || 'A person who is'}</p>
        <h2 className="mt-3 font-royal italic font-semibold text-5xl sm:text-6xl lg:text-7xl leading-[0.95]">{name}</h2>
        <p className="mt-5 mx-auto max-w-2xl text-sm sm:text-base leading-relaxed text-stone-600">{lines.join(' · ')}</p>
      </header>

      <div className="relative max-w-6xl mx-auto grid grid-cols-2 gap-x-4 gap-y-10 md:block md:aspect-[10/7.9]">
        {photos.map((photo, idx) => {
          const slot = SLOTS[idx];
          const s = slot || SLOTS[idx % SLOTS.length];
          return (
            <button
              key={photo.id ?? idx}
              type="button"
              onClick={(e) => open(photo, idx, e)}
              aria-label={`Open note: ${photo.caption || `memory ${idx + 1}`}`}
              style={{ '--l': `${s.l}%`, '--t': `${s.t}%`, transform: `rotate(${s.rot}deg)` }}
              className={`group relative block w-full text-center cursor-pointer transition-transform duration-300 hover:!rotate-0 hover:scale-[1.04] hover:z-30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#b08a3e] md:absolute md:left-[var(--l)] md:top-[var(--t)] md:w-[22%] ${
                slot ? '' : 'md:hidden'
              }`}
            >
              <Pin color={PINS[idx % PINS.length]} className="-top-2 w-4 h-4 sm:w-5 sm:h-5" />

              {/* Polaroid frame: photo on top, caption + note written on the thick bottom strip */}
              <div
                style={PAPER}
                className="p-[5%] pb-0 border border-[#ddd5c5] shadow-[0_10px_20px_-8px_rgba(60,40,20,0.45)] group-hover:shadow-[0_18px_30px_-10px_rgba(60,40,20,0.55)] transition-shadow"
              >
                <img
                  src={photo.url}
                  alt={photo.caption || `Memory ${idx + 1}`}
                  loading="lazy"
                  draggable={false}
                  className="w-full aspect-[10/11] object-cover ring-1 ring-black/10 saturate-[0.9] sepia-[0.08]"
                />
                <div className="flex flex-col items-center justify-center min-h-[5.5rem] sm:min-h-[6.5rem] lg:min-h-[7.25rem] pt-2 pb-3 px-1">
                  {/* Editorial caption: italic serif name, gold hairline, small-caps note */}
                  <p className="font-royal italic font-semibold text-[#2b1d16] text-[1.7rem] sm:text-[2rem] lg:text-[2.4rem] leading-none tracking-[-0.01em]">
                    {photo.caption}
                  </p>
                  <span aria-hidden="true" className="my-1.5 sm:my-2 flex items-center gap-1.5 text-[#b08a3e]">
                    <span className="w-6 sm:w-8 h-px bg-gradient-to-r from-transparent to-[#b08a3e]" />
                    <span className="w-1 h-1 rotate-45 bg-[#b08a3e]" />
                    <span className="w-6 sm:w-8 h-px bg-gradient-to-l from-transparent to-[#b08a3e]" />
                  </span>
                  {photo.note && (
                    <p className="max-w-[92%] font-royal uppercase text-[8.5px] sm:text-[10px] font-semibold tracking-[0.16em] leading-snug text-[#6b5a4a] line-clamp-2">
                      {photo.note}
                    </p>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Note modal */}
      {selected && (
        <div
          onClick={() => setSelected(null)}
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={PAPER}
            className="relative p-4 pb-6 max-w-sm w-full shadow-2xl text-center cursor-default -rotate-1"
          >
            <Pin color={selected.pin} className="-top-3 w-6 h-6" />
            <img src={selected.url} alt={selected.caption} className="w-full aspect-square object-cover ring-1 ring-black/10" />
            <p className="mt-4 font-royal italic font-semibold text-5xl text-[#2b1d16] leading-none">{selected.caption}</p>
            {selected.note && (
              <p className="mt-3 px-2 text-stone-700 leading-relaxed">
                {selected.note} {selected.emoji}
              </p>
            )}
            <button
              onClick={() => setSelected(null)}
              className="mt-5 px-6 py-2.5 bg-[#2b1d16] hover:bg-black text-[#f3e6cc] text-xs font-semibold tracking-wider uppercase transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

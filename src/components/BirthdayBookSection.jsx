import React, { useState, useEffect, useRef } from 'react';
import { useConfig } from '../config/ConfigContext';
import confetti from 'canvas-confetti';
import { ChevronLeft, ChevronRight, Heart, Star, Sparkles, Cake, Play, ZoomIn, X, RotateCcw } from 'lucide-react';

// A 3D flip book. Every leaf has a front (a right-hand page) and a back (the next left-hand page);
// flipping a leaf rotates it -180deg around the spine. All sizes inside pages use cqw (container
// query units) so a page scales as one piece, from the desktop spread to the phone and zoom views.

const MAROON = '#6e1f24';
const FLIP_MS = 900;
const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

const DEFAULT_BOOK = {
  caption: 'Happy Birthday, love.',
  notes: [
    'The day we met, I had no idea you would become my favourite person.',
    'Every little moment with you turned into a memory I keep.',
    'You make ordinary days feel like something worth celebrating.',
    'Here is to another year of us, and a hundred more after it.',
  ],
  intro: [
    'Today is all about you: the way you laugh too loud, the way you care too much, and the way you make everyone around you feel at home.',
    'I made this little book so you can flip through some of our favourite moments whenever you miss them.',
    'Thank you for being you. I hope this year is as kind to you as you are to everyone else.',
  ],
  song: { title: 'Our Song', artist: 'on repeat since we met', lyric: 'Every song I love somehow sounds like you, and every quiet moment feels like home.', highlight: 'home' },
  letter:
    "Happy birthday, my love.\n\nI wanted to write you something you could keep. Thank you for every laugh, every late-night talk, and every time you held my hand without me asking.\n\nYou make my world softer and brighter. I am so proud of who you are and so excited for everything this new year will bring you.\n\nI love you, today and always.",
  reasons: [
    'You make me feel safe and loved.',
    'You always make me smile.',
    'You understand me even when I do not say anything.',
    'You support me in everything I do.',
    'You make ordinary days feel special.',
    'You listen to me, even when I ramble.',
    'You care about the little things.',
    'You make me laugh on my worst days.',
    'You inspire me to be a better person.',
    'You are patient with me.',
    'You bring peace into my life.',
    'You are my best friend and my home.',
  ],
  closingNote: 'Thank you for being part of my life and making it so much brighter. I am so lucky to have you.',
};

// Paper and cover textures
const PAPER_BG = { backgroundColor: '#fbf9f5', backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,0.7), rgba(120,100,80,0.05))' };
const LINEN_BG = {
  backgroundColor: MAROON,
  backgroundImage:
    'repeating-linear-gradient(0deg, rgba(0,0,0,0.07) 0 1px, transparent 1px 3px), repeating-linear-gradient(90deg, rgba(255,255,255,0.04) 0 1px, transparent 1px 3px)',
};
const WOOD_BG = {
  backgroundColor: '#6b5644',
  backgroundImage:
    'repeating-linear-gradient(90deg, rgba(0,0,0,0.12) 0 2px, transparent 2px 9%), repeating-linear-gradient(0deg, rgba(255,255,255,0.03) 0 1px, transparent 1px 6px), linear-gradient(90deg, #6f5a47, #5d4a3a 50%, #6f5a47)',
};

const Face = ({ side, bg = PAPER_BG, className = '', children }) => (
  <div style={bg} className={`absolute inset-0 overflow-hidden [container-type:inline-size] [backface-visibility:hidden] ${className}`}>
    {children}
    {/* Shading towards the spine */}
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        background: `linear-gradient(to ${side === 'left' ? 'left' : 'right'}, rgba(0,0,0,0.25), rgba(0,0,0,0.06) 5%, transparent 14%)`,
      }}
    />
  </div>
);

const Img = ({ src, className = '' }) => <img src={src} alt="" draggable={false} loading="lazy" className={`object-cover ${className}`} />;

const Balloon = ({ color, className = '', delay = '0s' }) => (
  <div className={`absolute flex flex-col items-center animate-float ${className}`} style={{ animationDelay: delay }}>
    <div className="w-[9cqw] h-[11cqw] rounded-[50%] shadow-md" style={{ background: color }} />
    <div className="w-px h-[10cqw] bg-stone-400" />
  </div>
);

// ---------- pages ----------
const pages = {
  cover: ({ name, photo }) => (
    <Face side="right" bg={LINEN_BG}>
      <div className="absolute inset-[5%] border-[0.6cqw] border-[#d9b26a]/70" />
      <div className="absolute inset-[7%] border border-[#d9b26a]/40" />
      <div className="relative h-full flex flex-col items-center justify-center text-center px-[12%]">
        <p className="font-mono uppercase tracking-[0.4em] text-[2.3cqw] text-[#e9cf9a]">a little book for</p>
        <p className="font-script text-[13cqw] leading-none text-[#f6e9e0] mt-[3cqw]">Happy Birthday</p>
        <div className="mt-[5cqw] w-[46cqw] p-[2cqw] pb-[6cqw] bg-[#f6efe4] -rotate-3 shadow-[0_10px_25px_rgba(0,0,0,0.45)]">
          <Img src={photo(0)} className="w-full aspect-square" />
        </div>
        <p className="mt-[5cqw] font-royal italic font-semibold uppercase tracking-[0.25em] text-[6.5cqw] text-[#e9cf9a]">{name}</p>
        <p className="mt-[2cqw] font-mono text-[2.2cqw] text-[#f6e9e0]/70 animate-pulse">tap to open →</p>
      </div>
    </Face>
  ),

  s1Left: ({ photo, book, dateLabel }) => (
    <Face side="left" bg={LINEN_BG}>
      <div className="absolute top-[9%] left-[10%] w-[80%] p-[1.2cqw] bg-white/95 shadow-lg">
        <Img src={photo(1)} className="w-full aspect-[16/10] grayscale contrast-110" />
      </div>
      <p className="absolute top-[47%] inset-x-0 text-center font-mono text-[2.6cqw] text-[#f6e9e0]">{book.caption}</p>
      <div className="absolute bottom-[12%] inset-x-0 flex flex-col items-center gap-[2cqw] text-[#e9cf9a]">
        <Heart className="w-[12cqw] h-[12cqw]" strokeWidth={1.2} />
        <p className="font-mono uppercase tracking-[0.4em] text-[2.4cqw]">{dateLabel}</p>
      </div>
    </Face>
  ),

  s1Right: ({ photo }) => (
    <Face side="right">
      <Sparkles className="absolute top-[7%] left-[14%] w-[6cqw] h-[6cqw] text-[#6e1f24]" strokeWidth={1.5} />
      <Star className="absolute top-[20%] right-[12%] w-[5cqw] h-[5cqw] text-[#6e1f24]" strokeWidth={1.5} />
      <Heart className="absolute top-[30%] left-[10%] w-[4cqw] h-[4cqw] text-[#6e1f24]" strokeWidth={1.5} />
      <p className="absolute top-[10%] inset-x-0 text-center font-handwriting font-bold text-[11cqw] leading-[0.95] text-[#6e1f24] -rotate-6">
        Happiest
        <br />
        Birthday!
      </p>
      <div className="absolute right-0 bottom-0 w-[58%] h-[44%]" style={LINEN_BG} />
      <div className="absolute bottom-[7%] left-[16%] w-[60%] p-[1.4cqw] bg-white shadow-[0_10px_20px_rgba(0,0,0,0.3)] rotate-2">
        <Img src={photo(2)} className="w-full aspect-[4/5]" />
      </div>
    </Face>
  ),

  s2Left: ({ photo, book }) => {
    const Note = ({ text }) => <p className="w-[52%] font-mono text-[2.3cqw] leading-snug text-stone-600">{text}</p>;
    const Dot = ({ i }) => <Img src={photo(i)} className="w-[15cqw] h-[15cqw] rounded-full ring-[0.6cqw] ring-white shadow-md" />;
    return (
      <Face side="left">
        <div className="h-full flex flex-col justify-between px-[10%] py-[9%]">
          <div className="flex items-center justify-between"><Note text={book.notes[0]} /><Dot i={3} /></div>
          <div className="flex items-center gap-[4cqw]">
            <div
              className="w-[26cqw] h-[26cqw] flex items-center justify-center text-[#f6e9e0] -rotate-12"
              style={{ ...LINEN_BG, clipPath: 'polygon(50% 0,61% 23%,86% 14%,77% 39%,100% 50%,77% 61%,86% 86%,61% 77%,50% 100%,39% 77%,14% 86%,23% 61%,0 50%,23% 39%,14% 14%,39% 23%)' }}
            >
              <Cake className="w-[11cqw] h-[11cqw]" strokeWidth={1.3} />
            </div>
            <Note text={book.notes[1]} />
          </div>
          <div className="flex items-center justify-between"><Dot i={4} /><Note text={book.notes[2]} /></div>
          <div className="flex items-center justify-between"><Note text={book.notes[3]} /><Dot i={5} /></div>
        </div>
      </Face>
    );
  },

  s2Right: ({ photo, cal }) => (
    <Face side="right">
      <Img src={photo(6)} className="absolute top-0 inset-x-0 w-full h-[50%]" />
      <div className="absolute top-[53%] inset-x-[6%] bottom-[5%] flex flex-col">
        <p className="text-center font-royal italic font-semibold text-[5cqw] text-[#6e1f24] leading-none mb-[1.5cqw]">{cal.monthName}</p>
        <div className="grid grid-cols-7 flex-1 border-l border-t border-stone-300 text-[2.2cqw] font-semibold">
          {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((d) => (
            <div key={d} className="border-r border-b border-stone-300 flex items-center justify-center bg-stone-100 text-stone-800">{d}</div>
          ))}
          {cal.cells.map((d, i) => (
            <div key={i} className="relative border-r border-b border-stone-300 flex items-center justify-center text-stone-700 font-medium">
              {d}
              {d === cal.day && (
                <>
                  <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[5.5cqw] h-[5.5cqw] rounded-full border-[0.45cqw] border-[#c0262d] -rotate-6" />
                  <Heart className="absolute top-[4%] right-[8%] w-[3cqw] h-[3cqw] text-[#c0262d] fill-[#c0262d]" />
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </Face>
  ),

  s3Left: ({ photo }) => (
    <Face side="left">
      <div className="absolute top-[7%] inset-x-[9%] h-[68%] grid grid-cols-2 grid-rows-3 gap-[2cqw]">
        {[7, 8, 9, 10, 11, 12].map((i, k) => (
          <Img key={i} src={photo(i)} className={`w-full h-full shadow-sm ${k % 3 === 1 ? 'rotate-1' : '-rotate-1'}`} />
        ))}
      </div>
      <svg className="absolute bottom-0 inset-x-0 w-full h-[24%]" viewBox="0 0 100 30" preserveAspectRatio="none">
        <path d="M0 12 C 25 2, 45 22, 70 10 S 100 6, 100 6 L 100 30 L 0 30 Z" fill={MAROON} />
      </svg>
      <p className="absolute bottom-[5%] inset-x-0 text-center font-script text-[10cqw] text-[#f6e9e0] -rotate-3">love you!</p>
    </Face>
  ),

  s3Right: ({ photo, book }) => (
    <Face side="right">
      <p className="absolute top-[7%] inset-x-0 text-center font-script text-[12cqw] text-[#6e1f24] leading-none">Happy Birthday</p>
      <div className="absolute top-[24%] inset-x-[11%] space-y-[3cqw] font-mono text-[2.45cqw] leading-relaxed text-stone-700">
        {book.intro.map((p, i) => <p key={i}>{p}</p>)}
      </div>
      <div className="absolute right-0 bottom-0 w-[46%] h-[22%]" style={LINEN_BG} />
      <div className="absolute right-[10%] bottom-[5%] w-[34%] p-[1cqw] bg-white shadow-lg rotate-6">
        <Img src={photo(13)} className="w-full aspect-[4/3]" />
      </div>
    </Face>
  ),

  s4Left: ({ photo }) => (
    <Face side="left">
      <Img src={photo(14)} className="absolute top-0 inset-x-0 w-full h-[60%]" />
      <Img src={photo(15)} className="absolute bottom-0 left-0 w-[70%] h-[40%] border-t-[1cqw] border-r-[1cqw] border-white" />
      {/* Spinning vinyl peeking from the spine */}
      <div className="absolute right-[-16cqw] top-[52%] w-[36cqw] h-[36cqw] rounded-full shadow-[0_8px_20px_rgba(0,0,0,0.5)] animate-[spin_5s_linear_infinite] bg-[repeating-radial-gradient(circle,#151515_0_1px,#262626_1px_2.5px)] flex items-center justify-center">
        <div className="w-[34%] h-[34%] rounded-full flex items-center justify-center" style={LINEN_BG}>
          <div className="w-[18%] h-[18%] rounded-full bg-[#fbf9f5]" />
        </div>
        <div className="absolute inset-0 rounded-full bg-[conic-gradient(from_30deg,transparent_0_20%,rgba(255,255,255,0.12)_25%,transparent_30%_70%,rgba(255,255,255,0.08)_75%,transparent_80%)]" />
      </div>
    </Face>
  ),

  s4Right: ({ photo, book }) => {
    const { lyric, highlight } = book.song;
    const at = highlight ? lyric.indexOf(highlight) : -1;
    return (
      <Face side="right" bg={LINEN_BG}>
        <div className="absolute top-[12%] inset-x-[10%] text-[#f6e9e0]">
          <p className="font-royal font-semibold uppercase text-[5cqw] tracking-wide leading-none">
            This reminds me of <span className="font-script normal-case text-[10cqw] text-[#f3d9b1]">You</span>
          </p>
          <div className="mt-[7cqw] flex items-center gap-[3cqw]">
            <Img src={photo(16)} className="w-[17cqw] h-[17cqw] shadow-lg" />
            <div>
              <p className="font-bold text-[3.6cqw] leading-tight">{book.song.title}</p>
              <p className="text-[2.6cqw] text-[#f6e9e0]/70">{book.song.artist}</p>
            </div>
          </div>
          {/* Live music player bar */}
          <div className="mt-[4cqw] flex items-center gap-[2cqw] text-[2.2cqw] font-mono text-[#f6e9e0]/70">
            <Play className="w-[3.5cqw] h-[3.5cqw] fill-current" />
            <span>1:24</span>
            <div className="relative flex-1 h-[0.6cqw] bg-white/20 rounded-full overflow-hidden">
              <div className="absolute inset-y-0 left-0 bg-[#f3d9b1] rounded-full animate-[songProgress_40s_linear_infinite]" />
            </div>
            <span>3:47</span>
          </div>
          <p className="mt-[7cqw] font-semibold text-[4.6cqw] leading-snug">
            {at >= 0 ? (
              <>
                {lyric.slice(0, at)}
                <span className="relative inline-block font-handwriting text-[6cqw] text-[#f3d9b1]">
                  {highlight}
                  <svg className="absolute -bottom-[1cqw] left-0 w-full h-[2cqw]" viewBox="0 0 100 10" preserveAspectRatio="none">
                    <path d="M2 6 Q 25 1, 50 6 T 98 5" stroke="#f3d9b1" strokeWidth="2" fill="none" />
                  </svg>
                </span>
                {lyric.slice(at + highlight.length)}
              </>
            ) : (
              lyric
            )}
          </p>
        </div>
        <Sparkles className="absolute bottom-[12%] right-[12%] w-[7cqw] h-[7cqw] text-[#f3d9b1] animate-pulse" strokeWidth={1.3} />
        <Star className="absolute bottom-[22%] right-[26%] w-[3.5cqw] h-[3.5cqw] text-[#f3d9b1]" strokeWidth={1.3} />
      </Face>
    );
  },

  s5Left: ({ name, openLetter }) => (
    <Face side="left">
      <p className="absolute top-[13%] left-[10%] font-royal font-semibold uppercase text-[5.2cqw] text-[#6e1f24] leading-none">
        My message for <span className="font-script normal-case text-[10cqw]">You</span>
      </p>
      <span className="absolute top-[24%] left-[10%] px-[2cqw] py-[0.6cqw] font-mono text-[2.2cqw] text-[#f6e9e0]" style={LINEN_BG}>
        I love you, {name.toLowerCase()}
      </span>
      {/* Envelope: tap to open the letter */}
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); openLetter(); }}
        className="group absolute left-[16%] top-[42%] w-[64%] aspect-[4/3] -rotate-6 cursor-pointer"
        aria-label="Open the letter"
      >
        <div className="absolute inset-0 shadow-[0_12px_24px_rgba(0,0,0,0.35)]" style={LINEN_BG} />
        <div className="absolute left-[10%] right-[10%] -top-[22%] h-[75%] bg-white shadow p-[3cqw] transition-transform duration-500 group-hover:-translate-y-[4cqw]">
          {[...Array(6)].map((_, i) => <div key={i} className="h-[0.5cqw] bg-stone-300 mb-[2cqw]" style={{ width: `${90 - (i % 3) * 15}%` }} />)}
        </div>
        <div className="absolute inset-0 bg-[#5a171c]" style={{ clipPath: 'polygon(0 0, 50% 55%, 100% 0, 100% 100%, 0 100%)' }} />
        <div className="absolute inset-0 bg-[#7d252b]" style={{ clipPath: 'polygon(0 100%, 50% 45%, 100% 100%)' }} />
        <Heart className="absolute left-1/2 top-[50%] -translate-x-1/2 -translate-y-1/2 w-[8cqw] h-[8cqw] text-[#f3d9b1] fill-[#f3d9b1] group-hover:scale-110 transition-transform" />
      </button>
      <p className="absolute bottom-[9%] inset-x-0 text-center font-handwriting text-[5cqw] text-[#6e1f24] animate-pulse">tap the envelope ✉</p>
    </Face>
  ),

  s5Right: ({ photo }) => (
    <Face side="right" bg={WOOD_BG}>
      <div className="absolute top-[12%] left-[18%] w-[64%] h-[76%] bg-[#f5d9a8] rotate-3 outline-dashed outline-[1cqw] outline-offset-[-1.8cqw] outline-[#fbf9f5] shadow-[0_12px_30px_rgba(0,0,0,0.45)] p-[7cqw]">
        <div className="h-full bg-white p-[2cqw] flex flex-col gap-[2cqw] -rotate-2 shadow-md">
          <Img src={photo(17)} className="w-full flex-1 min-h-0" />
          <Img src={photo(18)} className="w-full flex-1 min-h-0" />
        </div>
      </div>
      <Star className="absolute top-[8%] left-[10%] w-[10cqw] h-[10cqw] text-[#a8323a] fill-[#a8323a] -rotate-12" />
      <Star className="absolute top-[17%] left-[24%] w-[6cqw] h-[6cqw] text-[#c4505a] fill-[#c4505a] rotate-12" />
      <Heart className="absolute bottom-[7%] right-[9%] w-[11cqw] h-[11cqw] text-[#a8323a] fill-[#a8323a] rotate-12 drop-shadow-lg" />
    </Face>
  ),

  s6Left: ({ book }) => (
    <Face side="left">
      <Balloon color="radial-gradient(circle at 35% 30%, #fff, #b9bcc4 45%, #7d818b)" className="top-[2%] left-[4%]" />
      <Balloon color="radial-gradient(circle at 35% 30%, #ff8a8a, #c0262d 50%, #7d1218)" className="top-[6%] right-[5%]" delay="-1.5s" />
      <Balloon color="radial-gradient(circle at 35% 30%, #ff8a8a, #c0262d 50%, #7d1218)" className="bottom-[1%] left-[3%]" delay="-2.5s" />
      <div className="absolute top-[9%] inset-x-[17%]">
        <p className="font-bold text-[5cqw] leading-tight text-stone-900">Reasons Why I Love You</p>
        <p className="font-script text-[6.5cqw] text-[#6e1f24] leading-none -mt-[0.5cqw]">I love you because</p>
        <ul className="mt-[3cqw] space-y-[1.15cqw] text-[2.35cqw] text-stone-700">
          {book.reasons.slice(0, 13).map((r, i) => (
            <li key={i} className="flex gap-[1.5cqw] border-b border-dotted border-stone-300 pb-[0.4cqw]">
              <span className="text-[#c0262d]">•</span>
              {r}
            </li>
          ))}
        </ul>
      </div>
    </Face>
  ),

  s6Right: ({ photo, book, name }) => (
    <Face side="right">
      <Img src={photo(19)} className="absolute inset-0 w-full h-full sepia-[0.25] contrast-[1.05]" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20" />
      <p className="absolute top-[6%] right-[6%] w-[52%] bg-white/95 p-[2.5cqw] font-mono text-[2.3cqw] leading-snug text-stone-800 shadow-lg">
        {book.closingNote}
      </p>
      <p className="absolute bottom-[7%] left-[8%] bg-white/95 px-[2.5cqw] py-[1cqw] font-mono text-[2.3cqw] text-stone-800 shadow-lg -rotate-2">
        I love you, always and forever, {name}.
      </p>
    </Face>
  ),

  back: ({ name }) => (
    <Face side="left" bg={LINEN_BG}>
      <div className="absolute inset-[5%] border-[0.6cqw] border-[#d9b26a]/70" />
      {/* Pop-up slot the sunflower rises out of */}
      <div className="absolute left-1/2 top-[62%] -translate-x-1/2 w-[36cqw] h-[1.4cqw] rounded-full bg-black/45 blur-[0.4cqw]" />
      <div className="relative h-full flex flex-col items-center justify-end pb-[13%] text-center px-[14%] text-[#f6e9e0]">
        <p className="font-script text-[13cqw] leading-none">the end</p>
        <p className="font-mono text-[2.4cqw] mt-[3cqw] text-[#f6e9e0]/80">of this chapter, with so many more to come</p>
        <p className="mt-[4cqw] font-royal italic uppercase tracking-[0.25em] text-[3.2cqw] text-[#e9cf9a]">made with love for {name}</p>
      </div>
    </Face>
  ),
};

// Pop-up sunflower that stands out of the back cover. It lives outside the page faces (they clip and
// flatten 3D), on the left half of the book. When `open`, the book tilts back and the flower hinges
// up from the page; petals then unfold one by one.
const PETALS = 16;
const Sunflower = ({ open }) => {
  const petal = (i, ring) => {
    const front = ring === 1;
    return (
      <span
        key={`${ring}-${i}`}
        className="absolute left-1/2 top-1/2 origin-bottom [border-radius:50%_50%_50%_50%/85%_85%_15%_15%] shadow-[inset_0_-1cqw_2cqw_rgba(150,80,0,0.35)]"
        style={{
          width: front ? '11cqw' : '12cqw',
          height: front ? '25cqw' : '29cqw',
          marginLeft: front ? '-5.5cqw' : '-6cqw',
          marginTop: front ? '-25cqw' : '-29cqw',
          background: front ? 'linear-gradient(to top, #e89a00, #ffc21a 45%, #ffe066)' : 'linear-gradient(to top, #b86e00, #e8a000 45%, #f7c531)',
          transform: `rotate(${i * (360 / PETALS) + (front ? 360 / PETALS / 2 : 0)}deg) scale(${open ? 1 : 0})`,
          transition: `transform 0.55s cubic-bezier(0.34, 1.5, 0.6, 1) ${open ? 1.1 + i * 0.035 + ring * 0.25 : 0}s`,
        }}
      />
    );
  };
  const leaf = (side, top) => (
    <span
      className="absolute w-[22cqw] h-[10cqw] bg-gradient-to-br from-[#7cbf5a] via-[#4e9a33] to-[#2f6b1f] [border-radius:0_100%_0_100%] shadow-sm"
      style={{
        top,
        left: '50%',
        transformOrigin: '0 50%', // pivot on the stem; the left leaf is mirrored around it
        transform: `${side === 'left' ? 'scaleX(-1) ' : ''}rotate(-22deg) scale(${open ? 1 : 0})`,
        transition: `transform 0.6s cubic-bezier(0.34, 1.5, 0.6, 1) ${open ? 0.9 : 0}s`,
      }}
    />
  );

  return (
    <div aria-hidden="true" className="absolute top-0 left-0 w-1/2 h-full pointer-events-none [container-type:inline-size] [transform-style:preserve-3d]">
      <div
        className="absolute left-1/2 [transform-style:preserve-3d]"
        style={{
          top: '62%', width: '64cqw', height: '96cqw', marginLeft: '-32cqw', marginTop: '-96cqw',
          transformOrigin: '50% 100%',
          transform: `rotateX(${open ? -50 : 0}deg)`,
          opacity: open ? 1 : 0,
          transition: open
            ? 'transform 1.3s cubic-bezier(0.34, 1.4, 0.5, 1) 0.2s, opacity 0.2s 0.2s'
            : 'transform 0.4s ease-in, opacity 0.2s 0.2s',
        }}
      >
        <div className="absolute inset-0 origin-bottom animate-sway">
          {/* Stem + leaves */}
          <span className="absolute left-1/2 top-[34cqw] bottom-0 w-[3.2cqw] -ml-[1.6cqw] rounded-full bg-gradient-to-r from-[#2f6b1f] via-[#6aa84f] to-[#2f6b1f]" />
          {leaf('right', '58cqw')}
          {leaf('left', '70cqw')}
          {/* Flower head */}
          <div className="absolute top-0 left-0 w-[64cqw] h-[64cqw] drop-shadow-[0_2cqw_3cqw_rgba(0,0,0,0.35)]">
            {Array.from({ length: PETALS }, (_, i) => petal(i, 0))}
            {Array.from({ length: PETALS }, (_, i) => petal(i, 1))}
            <span
              className="absolute left-1/2 top-1/2 w-[25cqw] h-[25cqw] -ml-[12.5cqw] -mt-[12.5cqw] rounded-full shadow-[inset_0_0_3cqw_rgba(0,0,0,0.55),0_0_0_0.8cqw_rgba(120,70,20,0.6)]"
              style={{
                background:
                  'radial-gradient(rgba(214,150,60,0.75) 0.45cqw, transparent 0.65cqw) 0 0 / 2.2cqw 2.2cqw, radial-gradient(circle at 40% 35%, #7a4a1f, #4a2a10 60%, #2a1607)',
                transform: `scale(${open ? 1 : 0})`,
                transition: `transform 0.5s cubic-bezier(0.34, 1.5, 0.6, 1) ${open ? 0.95 : 0}s`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// [front, back] per leaf: the cover, six spreads, the back cover
const LEAVES = [
  ['cover', 's1Left'],
  ['s1Right', 's2Left'],
  ['s2Right', 's3Left'],
  ['s3Right', 's4Left'],
  ['s4Right', 's5Left'],
  ['s5Right', 's6Left'],
  ['s6Right', 'back'],
];

const buildCalendar = (label) => {
  const [mon, dayStr] = (label || '').trim().toUpperCase().split(/\s+/);
  const now = new Date();
  const month = MONTHS.indexOf(mon) >= 0 ? MONTHS.indexOf(mon) : now.getMonth();
  const day = parseInt(dayStr, 10) || now.getDate();
  const start = new Date(now.getFullYear(), month, 1).getDay();
  const total = new Date(now.getFullYear(), month + 1, 0).getDate();
  const cells = [...Array(start).fill(''), ...Array.from({ length: total }, (_, i) => i + 1)];
  while (cells.length % 7) cells.push('');
  const monthName = new Date(now.getFullYear(), month, 1).toLocaleString('en', { month: 'long' });
  return { cells, day, monthName };
};

export default function BirthdayBookSection() {
  const { config } = useConfig();
  const name = config.hero?.recipientName || config.clientName || 'You';
  const book = { ...DEFAULT_BOOK, ...(config.book || {}) };
  book.song = { ...DEFAULT_BOOK.song, ...(config.book?.song || {}) };

  const urls = [...new Set([...(config.polaroids || []), ...(config.hero?.ribbonPhotos || [])].map((p) => p.url).filter(Boolean))];
  const photo = (i) => urls[i % Math.max(urls.length, 1)];
  const cal = buildCalendar(config.birthDateLabel);

  const [flipped, setFlipped] = useState(0); // leaves turned so far (0 = closed on the cover)
  const [turning, setTurning] = useState(null);
  const [zoom, setZoom] = useState(false);
  const [letterOpen, setLetterOpen] = useState(false);
  const [bloom, setBloom] = useState(false);
  const touchX = useRef(null);
  const timer = useRef(null);
  const total = LEAVES.length;

  useEffect(() => () => clearTimeout(timer.current), []);

  // The sunflower pops up once the book has closed on the back cover
  useEffect(() => {
    if (flipped !== LEAVES.length) return setBloom(false);
    const t = setTimeout(() => setBloom(true), FLIP_MS);
    return () => clearTimeout(t);
  }, [flipped]);

  const go = (dir) => {
    const next = flipped + dir;
    if (next < 0 || next > total || turning !== null) return;
    setTurning(dir > 0 ? flipped : next);
    setFlipped(next);
    timer.current = setTimeout(() => setTurning(null), FLIP_MS);
    if (next === total) confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 }, colors: [MAROON, '#e9cf9a', '#f6e9e0', '#c0262d'] });
  };

  // Esc closes overlays
  useEffect(() => {
    if (!zoom && !letterOpen) return;
    const onKey = (e) => e.key === 'Escape' && (setZoom(false), setLetterOpen(false));
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [zoom, letterOpen]);

  const ctx = { name, photo, book, cal, dateLabel: config.birthDateLabel || '', openLetter: () => setLetterOpen(true) };
  const render = (key) => pages[key](ctx);

  // Closed book sits centred: shift by a quarter when only the cover (or back) is showing
  const shift = flipped === 0 ? '-25%' : flipped === total ? '25%' : '0%';
  const label = flipped === 0 ? 'Cover' : flipped === total ? 'The end' : `Pages ${flipped * 2 - 1}–${flipped * 2}`;
  const leftKey = flipped > 0 ? LEAVES[flipped - 1][1] : null;
  const rightKey = flipped < total ? LEAVES[flipped][0] : null;

  return (
    <section id="book" className="relative overflow-hidden bg-[#fbf3e3] py-20 sm:py-24 px-3 sm:px-8">
      <div aria-hidden="true" className="absolute inset-0 opacity-50 bg-[radial-gradient(#e8d9bd_1px,transparent_1px)] [background-size:22px_22px]" />

      <div className="relative text-center mb-10 sm:mb-14">
        <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.35em] text-[#6e1f24]/70">Our birthday book</p>
        <h2 className="mt-3 font-royal italic font-semibold text-5xl sm:text-6xl lg:text-7xl leading-[0.95] text-[#6e1f24]">Flip through our story</h2>
        <p className="mt-5 text-sm sm:text-base leading-relaxed text-stone-500">Tap a page, swipe, or use the arrows to turn it.</p>
      </div>

      {/* The book */}
      <div
        className="relative mx-auto w-full aspect-[3/2] [perspective:2800px] outline-none"
        style={{ maxWidth: 'min(1040px, 100vh)' }}
        tabIndex={0}
        aria-label={`Birthday book, ${label}. Use left and right arrow keys to turn pages.`}
        onKeyDown={(e) => (e.key === 'ArrowRight' ? go(1) : e.key === 'ArrowLeft' ? go(-1) : null)}
        onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          const dx = e.changedTouches[0].clientX - (touchX.current ?? 0);
          if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
        }}
      >
        <div className="absolute inset-0 [transform-style:preserve-3d] transition-transform duration-700 ease-out" style={{ transform: `translateX(${shift})${bloom ? ' translateY(6%) rotateX(40deg)' : ''}` }}>
          {/* Soft shadow under the book */}
          <div
            aria-hidden="true"
            className="absolute -bottom-[4%] h-[8%] rounded-[50%] bg-black/25 blur-xl transition-all duration-700"
            style={{ left: flipped === 0 ? '52%' : '2%', right: flipped === total ? '52%' : '2%' }}
          />
          <Sunflower open={bloom} />
          {LEAVES.map(([front, back], i) => {
            const isFlipped = i < flipped;
            return (
              <div
                key={i}
                className="absolute top-0 right-0 w-1/2 h-full origin-left [transform-style:preserve-3d] cursor-pointer shadow-[0_6px_18px_rgba(60,30,20,0.25)]"
                style={{
                  transform: `rotateY(${isFlipped ? -180 : 0}deg)`,
                  transition: `transform ${FLIP_MS}ms cubic-bezier(0.645, 0.045, 0.355, 1)`,
                  zIndex: turning === i ? 100 : isFlipped ? i + 1 : total - i,
                }}
              >
                <div className="absolute inset-0" onClick={() => go(1)}>{render(front)}</div>
                <div className="absolute inset-0 [transform:rotateY(180deg)] [backface-visibility:hidden]" onClick={() => go(-1)}>{render(back)}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Controls */}
      <div className="relative mt-10 flex items-center justify-center gap-3 sm:gap-5">
        <button onClick={() => go(-1)} disabled={flipped === 0} aria-label="Previous page" className="w-11 h-11 rounded-full bg-[#6e1f24] text-[#f6e9e0] flex items-center justify-center shadow-md hover:brightness-110 disabled:opacity-30 transition">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex flex-col items-center gap-2 min-w-[120px]">
          <span className="font-sans text-[11px] font-semibold uppercase tracking-[0.25em] text-[#6e1f24]">{label}</span>
          <div className="flex gap-1.5">
            {Array.from({ length: total + 1 }, (_, i) => (
              <span key={i} className={`h-1.5 rounded-full transition-all duration-500 ${i === flipped ? 'w-5 bg-[#6e1f24]' : 'w-1.5 bg-[#6e1f24]/25'}`} />
            ))}
          </div>
        </div>
        <button onClick={() => (flipped === total ? (setFlipped(0), setTurning(null)) : go(1))} aria-label={flipped === total ? 'Read again' : 'Next page'} className="w-11 h-11 rounded-full bg-[#6e1f24] text-[#f6e9e0] flex items-center justify-center shadow-md hover:brightness-110 transition">
          {flipped === total ? <RotateCcw className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
        </button>
        <button onClick={() => setZoom(true)} aria-label="Read up close" className="ml-1 sm:ml-3 h-11 px-4 rounded-full border border-[#6e1f24]/40 text-[#6e1f24] text-xs font-semibold flex items-center gap-1.5 hover:bg-[#6e1f24]/5 transition">
          <ZoomIn className="w-4 h-4" /> <span className="hidden sm:inline">Read up close</span>
        </button>
      </div>

      {/* Zoomed spread for reading on small screens */}
      {zoom && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm overflow-y-auto p-4 sm:p-10" onClick={() => setZoom(false)}>
          <button aria-label="Close" className="fixed top-4 right-4 w-10 h-10 rounded-full bg-white/90 flex items-center justify-center z-10">
            <X className="w-5 h-5" />
          </button>
          <div className="mx-auto max-w-5xl flex flex-col md:flex-row gap-4 md:gap-0 mt-10" onClick={(e) => e.stopPropagation()}>
            {[leftKey, rightKey].filter(Boolean).map((key) => (
              <div key={key} className="relative w-full md:w-1/2 aspect-[3/4] shadow-2xl">{render(key)}</div>
            ))}
          </div>
        </div>
      )}

      {/* The letter */}
      {letterOpen && (
        <div className="fixed inset-0 z-[60] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setLetterOpen(false)}>
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-md w-full bg-[#fffdf8] p-8 shadow-2xl -rotate-1 animate-pop-in bg-[repeating-linear-gradient(transparent_0_31px,#e8dccb_31px_32px)]"
          >
            <Heart className="absolute -top-5 left-1/2 -translate-x-1/2 w-10 h-10 text-[#c0262d] fill-[#c0262d] drop-shadow" />
            <p className="font-handwriting text-2xl leading-8 text-stone-800 whitespace-pre-line">{book.letter}</p>
            <button onClick={() => setLetterOpen(false)} className="mt-6 px-6 py-2.5 bg-[#6e1f24] text-[#f6e9e0] text-xs font-semibold uppercase tracking-wider hover:brightness-110">
              Fold it back
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

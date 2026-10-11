import React, { useState, useEffect, useRef } from 'react';
import { useConfig } from '../config/ConfigContext';
import confetti from 'canvas-confetti';
import { ArrowUp, Smile, Wifi, Battery, Signal, RotateCcw, Sparkles } from 'lucide-react';

const TYPING_MS = 900;

// Deterministic star field (no Math.random, so it doesn't reshuffle on re-render)
const STARS = Array.from({ length: 70 }, (_, i) => ({
  left: (i * 37.7) % 100,
  top: (i * 61.3) % 100,
  size: i % 7 === 0 ? 3 : i % 3 === 0 ? 2 : 1,
  delay: ((i * 0.43) % 4).toFixed(2),
  duration: (2.5 + ((i * 0.71) % 3)).toFixed(2),
}));

// Rotating star field: one 1px element per layer carrying hundreds of box-shadow "stars".
// Seeded LCG so the sky is identical on every render.
const SKY = 4000; // px, square that rotates around the moon
const starShadows = (count, seed, color) => {
  let x = seed;
  const rand = () => ((x = (x * 1664525 + 1013904223) % 4294967296) / 4294967296);
  return Array.from({ length: count }, () => `${Math.round(rand() * SKY)}px ${Math.round(rand() * SKY)}px ${color}`).join(',');
};
const SKY_SMALL = starShadows(500, 7, 'rgba(255,255,255,0.75)');
const SKY_BIG = starShadows(150, 42, 'rgba(255,240,220,0.95)');

const SHOOTING = [
  { top: '12%', left: '30%', delay: '1s', duration: '9s' },
  { top: '35%', left: '85%', delay: '4.5s', duration: '11s' },
  { top: '8%', left: '65%', delay: '7s', duration: '13s' },
];

// Ambient and slow, so it animates even with "Reduce motion" on (owner's explicit request).
const NightSky = () => (
  <div aria-hidden="true" className="absolute inset-0 pointer-events-none overflow-hidden">
    {/* Drifting nebula haze */}
    <div className="absolute -top-32 -left-32 w-[560px] h-[560px] rounded-full bg-fuchsia-700/20 blur-[120px] animate-drift" />
    <div className="absolute bottom-[-160px] right-[-120px] w-[520px] h-[520px] rounded-full bg-rose-600/15 blur-[120px] animate-drift [animation-delay:-12s]" />
    <div className="absolute top-1/3 left-1/3 w-[420px] h-[300px] rounded-full bg-indigo-500/10 blur-[110px] animate-drift [animation-delay:-6s]" />

    {/* Star field slowly wheeling around the moon (centre = moon centre) */}
    <div
      className="absolute animate-sky-rotate"
      style={{ width: SKY, height: SKY, top: `calc(112px - ${SKY / 2}px)`, right: `calc(8% + 48px - ${SKY / 2}px)` }}
    >
      <span className="absolute top-0 left-0 w-px h-px rounded-full" style={{ boxShadow: SKY_SMALL }} />
      <span className="absolute top-0 left-0 w-[2px] h-[2px] rounded-full animate-blink [animation-duration:5s]" style={{ boxShadow: SKY_BIG }} />
    </div>

    {/* Bright twinkling stars */}
    {STARS.map((s, i) => (
      <span
        key={i}
        className="absolute rounded-full bg-white animate-blink"
        style={{
          left: `${s.left}%`, top: `${s.top}%`, width: s.size, height: s.size,
          animationDelay: `${s.delay}s`, animationDuration: `${s.duration}s`,
          boxShadow: s.size > 2 ? '0 0 6px 1px rgba(255,255,255,0.7)' : undefined,
        }}
      />
    ))}

    {/* Shooting stars: wrapper sets the angle, inner streak flies along it */}
    {SHOOTING.map((s, i) => (
      <div key={i} className="absolute rotate-[155deg]" style={{ top: s.top, left: s.left }}>
        <span
          className="block w-32 h-px bg-gradient-to-r from-transparent via-white/60 to-white rounded-full shadow-[0_0_6px_1px_rgba(255,255,255,0.6)] opacity-0 animate-shoot"
          style={{ animationDelay: s.delay, animationDuration: s.duration }}
        />
      </div>
    ))}

    {/* Glowing moon: pulsing halo + craters + gentle float */}
    <div className="absolute top-16 right-[8%] w-16 h-16 sm:w-24 sm:h-24 animate-float [animation-duration:8s]">
      <div className="absolute -inset-24 sm:-inset-36 rounded-full bg-[radial-gradient(circle,rgba(255,215,150,0.22),rgba(255,190,120,0.07)_40%,transparent_68%)] animate-moon-glow [animation-delay:-3s]" />
      <div className="absolute -inset-8 sm:-inset-12 rounded-full bg-[radial-gradient(circle,rgba(255,236,190,0.75)_30%,rgba(255,210,140,0.25)_55%,transparent_72%)] animate-moon-glow" />
      <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_35%_35%,#fffaf0,#f3dcaa_55%,#c9a46a)] shadow-[0_0_40px_12px_rgba(255,220,150,0.35),inset_-8px_-6px_16px_rgba(150,110,60,0.35)]">
        <span className="absolute top-[22%] left-[52%] w-[22%] h-[22%] rounded-full bg-[#d9bd88]/60 shadow-[inset_1px_1px_2px_rgba(120,90,40,0.35)]" />
        <span className="absolute top-[55%] left-[25%] w-[16%] h-[16%] rounded-full bg-[#d9bd88]/55 shadow-[inset_1px_1px_2px_rgba(120,90,40,0.35)]" />
        <span className="absolute top-[62%] left-[60%] w-[10%] h-[10%] rounded-full bg-[#d9bd88]/50" />
      </div>
    </div>
  </div>
);

export default function PhoneChatSection() {
  const { config } = useConfig();
  const chatConfig = config.chat || {};
  const script = chatConfig.messages || [];

  const [revealed, setRevealed] = useState(0); // how many scripted messages are fully revealed
  const [isTyping, setIsTyping] = useState(false);
  const [extra, setExtra] = useState([]); // replies typed by the visitor after the reveal
  const [inputValue, setInputValue] = useState('');
  const [reactions, setReactions] = useState({});
  const bodyRef = useRef(null);
  const timers = useRef([]);

  const allRevealed = revealed >= script.length;
  const later = (fn, ms) => timers.current.push(setTimeout(fn, ms));

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  // Restart the reveal if the client edits the script in the studio
  useEffect(() => {
    setRevealed(0);
    setExtra([]);
    setReactions({});
  }, [script]);

  // Keep the newest bubble in view inside the phone
  useEffect(() => {
    const el = bodyRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [revealed, isTyping, extra.length]);

  const revealNext = () => {
    if (isTyping || allRevealed) return;
    const next = revealed + 1;
    setRevealed(next);

    if (next >= script.length) {
      later(() => {
        confetti({ particleCount: 90, spread: 80, origin: { y: 0.6 }, colors: ['#f0a868', '#fda4af', '#fde68a', '#ffffff'] });
      }, 350);
      return;
    }
    // Brief "typing…" before the next sealed bubble appears
    later(() => setIsTyping(true), 350);
    later(() => setIsTyping(false), 350 + TYPING_MS);
  };

  const replay = () => {
    timers.current.forEach(clearTimeout);
    setIsTyping(false);
    setRevealed(0);
    setExtra([]);
    setReactions({});
  };

  const toggleReaction = (key, fallback) => {
    setReactions((prev) => {
      const current = key in prev ? prev[key] : fallback;
      return { ...prev, [key]: current ? null : '❤️' };
    });
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputValue.trim() || !allRevealed) return;
    setExtra((prev) => [...prev, { id: `me-${Date.now()}`, text: inputValue, isSender: true }]);
    setInputValue('');
    later(() => setIsTyping(true), 400);
    later(() => {
      setIsTyping(false);
      setExtra((prev) => [...prev, { id: `re-${Date.now()}`, text: 'Aww you are the sweetest! Thank you so much! 🥹❤️', reaction: '❤️' }]);
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.6 } });
    }, 1600);
  };

  // Scripted messages up to and including the next sealed one, then any visitor replies
  const visible = script.slice(0, isTyping ? revealed : revealed + 1);
  const lastRevealedIdx = revealed - 1;

  const renderBubble = (msg, key, { sealed = false, isLast = false } = {}) => {
    const mine = msg.isSender;
    const reaction = key in reactions ? reactions[key] : msg.reaction;
    return (
      <div key={key} className={`flex flex-col animate-pop-in ${mine ? 'items-end origin-bottom-right' : 'items-start origin-bottom-left'}`}>
        <div
          onClick={sealed ? revealNext : undefined}
          onDoubleClick={sealed ? undefined : () => toggleReaction(key, msg.reaction)}
          role={sealed ? 'button' : undefined}
          tabIndex={sealed ? 0 : undefined}
          onKeyDown={sealed ? (e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), revealNext()) : undefined}
          aria-label={sealed ? 'Tap to reveal the next message' : undefined}
          className={`relative max-w-[85%] px-4 py-2.5 rounded-[20px] text-[13.5px] leading-relaxed transition-[filter,transform] duration-500 ${
            mine
              ? 'bg-zinc-700 text-white rounded-br-md'
              : 'bg-gradient-to-br from-[#f3ad6d] to-[#e08a4b] text-[#2c1402] font-semibold rounded-bl-md shadow-[0_4px_14px_-4px_rgba(229,149,86,0.55)]'
          } ${sealed ? 'cursor-pointer min-w-[62%] hover:scale-[1.02] active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-300' : ''}`}
        >
          <span className={`block transition-[filter,opacity] duration-500 ${sealed ? 'blur-[6px] opacity-70 select-none' : 'blur-0'}`}>
            {msg.text}
          </span>

          {sealed && (
            <>
              <span className="absolute inset-0 rounded-[inherit] bg-[linear-gradient(110deg,transparent_30%,rgba(255,255,255,0.45)_50%,transparent_70%)] bg-[length:200%_100%] animate-[goldShimmer_2.2s_linear_infinite]" />
              <span className="absolute inset-0 flex items-center justify-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-[#3b1a04]">
                <Sparkles className="w-3.5 h-3.5" /> Tap to reveal
              </span>
            </>
          )}

          {!sealed && reaction && (
            <span className="absolute -top-3 -left-2 w-7 h-7 rounded-full bg-zinc-800 border-2 border-[#121214] flex items-center justify-center text-[12px] shadow-md animate-pop-in [animation-delay:400ms]">
              {reaction}
            </span>
          )}
        </div>

        {isLast && (
          <span className="text-[10px] text-zinc-500 mt-1 ml-1 font-mono">
            {chatConfig.readReceipt || 'Read 6:10 pm'} ✓✓
          </span>
        )}
      </div>
    );
  };

  return (
    <section id="chat" className="relative min-h-screen py-20 sm:py-24 px-4 flex items-center justify-center overflow-hidden text-white bg-[radial-gradient(ellipse_at_top_right,#2e2140_0%,#1a1226_40%,#0b0910_100%)]">
      <NightSky />

      <div className="max-w-md w-full relative z-10 flex flex-col items-center">
        {/* Heading */}
        <div className="text-center mb-10">
          <span className="font-sans text-[11px] font-semibold uppercase tracking-[0.35em] text-rose-200/70">A late night conversation</span>
          <h2 className="mt-3 font-royal italic font-semibold text-5xl sm:text-6xl lg:text-7xl leading-[0.95]">
            <span className="gold-shimmer-text">Midnight Words</span>
          </h2>
          <p className="mt-5 text-sm sm:text-base leading-relaxed text-zinc-400">Some words are better read one at a time.</p>
        </div>

        {/* Soft glow behind the phone */}
        <div aria-hidden="true" className="absolute top-40 left-1/2 -translate-x-1/2 w-[420px] h-[520px] rounded-full bg-[#e59556]/20 blur-[110px] pointer-events-none" />

        {/* iPhone chassis */}
        <div className="relative w-full max-w-[340px] sm:max-w-[370px] bg-[#0c0c0e] rounded-[52px] p-3 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.95),inset_0_0_0_1px_rgba(255,255,255,0.08)] border-[5px] border-[#2c2b30] ring-1 ring-white/10">
          {/* Side buttons */}
          <span aria-hidden="true" className="absolute -left-[9px] top-28 w-1 h-10 bg-[#2c2b30] rounded-l" />
          <span aria-hidden="true" className="absolute -left-[9px] top-44 w-1 h-14 bg-[#2c2b30] rounded-l" />
          <span aria-hidden="true" className="absolute -right-[9px] top-36 w-1 h-16 bg-[#2c2b30] rounded-r" />

          {/* Screen */}
          <div className="bg-[#121214] rounded-[42px] overflow-hidden flex flex-col h-[640px] sm:h-[680px] relative select-none">
            {/* Status bar */}
            <div className="pt-3 px-6 flex items-center justify-between text-[11px] font-semibold text-zinc-300 z-20">
              <span>6:10 pm</span>
              <div className="w-24 h-6 bg-black rounded-full flex items-center justify-end px-2">
                <div className="w-2.5 h-2.5 rounded-full bg-zinc-800 ring-1 ring-zinc-700/60" />
              </div>
              <div className="flex items-center gap-1.5">
                <Signal className="w-3 h-3" />
                <Wifi className="w-3 h-3" />
                <Battery className="w-4 h-4 fill-zinc-300" />
              </div>
            </div>

            {/* Contact header */}
            <div className="pt-4 pb-3 px-4 flex flex-col items-center border-b border-zinc-800/80">
              <div className="relative">
                <img
                  src={chatConfig.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                  alt={chatConfig.contactName}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-amber-500/40"
                />
                <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-[#121214]" />
              </div>
              <h3 className="mt-1.5 font-bold text-sm text-zinc-100 tracking-tight">{chatConfig.contactName || 'Sweet Sana'}</h3>
              <span className="text-[10px] text-zinc-400 font-medium">
                {isTyping ? 'typing…' : chatConfig.status || 'iMessage • online now'}
              </span>
            </div>

            {/* Messages */}
            <div ref={bodyRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3.5 [scrollbar-width:none]">
              <div className="text-center my-2">
                <span className="text-[10px] uppercase font-mono tracking-wider bg-zinc-800/60 text-zinc-400 px-2.5 py-1 rounded-full">
                  {chatConfig.timeLabel || 'TODAY 6:10 PM'}
                </span>
              </div>

              {visible.map((msg, i) =>
                renderBubble(msg, msg.id || `s${i}`, {
                  sealed: i === revealed,
                  isLast: i === lastRevealedIdx && allRevealed && extra.length === 0,
                })
              )}
              {extra.map((msg) => renderBubble(msg, msg.id))}

              {isTyping && (
                <div className="flex items-center gap-1.5 bg-zinc-800 w-16 px-3.5 py-3 rounded-[20px] rounded-bl-md animate-pop-in origin-bottom-left">
                  <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" />
                </div>
              )}
            </div>

            {/* Input: unlocks once every message has been revealed */}
            <form onSubmit={handleSend} className="p-3 border-t border-zinc-800 flex items-center gap-2">
              <div className="flex-1 bg-zinc-900 border border-zinc-700/60 rounded-full px-3.5 py-1.5 flex items-center text-xs focus-within:border-amber-500/80">
                <input
                  type="text"
                  disabled={!allRevealed}
                  placeholder={allRevealed ? 'iMessage' : 'Reveal every message first 💌'}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className="bg-transparent outline-none w-full text-zinc-100 placeholder:text-zinc-500 text-xs disabled:cursor-not-allowed"
                />
                <Smile className="w-4 h-4 text-zinc-500 shrink-0 ml-1" />
              </div>
              <button
                type="submit"
                disabled={!allRevealed}
                className="w-7 h-7 rounded-full bg-[#e59556] flex items-center justify-center text-[#2b1704] hover:brightness-110 active:scale-90 transition shrink-0 disabled:opacity-40"
                title="Send"
              >
                <ArrowUp className="w-4 h-4 stroke-[2.5]" />
              </button>
            </form>

            <div className="pb-1.5 flex justify-center">
              <div className="w-28 h-1 bg-zinc-600 rounded-full" />
            </div>
          </div>
        </div>

        {/* Progress + replay */}
        <div className="mt-6 flex flex-col items-center gap-3">
          <div className="flex gap-1.5" aria-label={`${revealed} of ${script.length} messages revealed`}>
            {script.map((_, i) => (
              <span key={i} className={`h-1.5 rounded-full transition-all duration-500 ${i < revealed ? 'w-6 bg-[#f0a868]' : 'w-1.5 bg-zinc-700'}`} />
            ))}
          </div>
          {allRevealed ? (
            <button
              onClick={replay}
              className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-amber-200 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Replay · double-tap a bubble to ❤️ it · reply above
            </button>
          ) : (
            <p className="text-xs text-zinc-400">Tap the glowing bubble to read the next message</p>
          )}
        </div>
      </div>
    </section>
  );
}

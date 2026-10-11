import React, { useState, useEffect, useRef } from 'react';
import { useConfig } from '../config/ConfigContext';
import confetti from 'canvas-confetti';
import { Volume2 } from 'lucide-react';
import { youtubeId, ytEmbed, ytCommand } from '../youtube';

const DEFAULT_VIDEO = 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4';
const CURTAIN_MS = 2800;

// Velvet: alternating stripes + vertical fold shading
const VELVET = {
  backgroundColor: '#5f161c',
  backgroundImage:
    'repeating-linear-gradient(90deg, rgba(0,0,0,0.38) 0px, rgba(255,255,255,0.07) 19px, rgba(0,0,0,0.38) 38px), repeating-linear-gradient(90deg, #5f161c 0px, #7a1d24 38px, #5f161c 76px)',
  boxShadow: 'inset 0 0 120px rgba(0,0,0,0.7)',
};

const pad = (n) => String(n).padStart(2, '0');
const remaining = (target) => {
  const diff = Math.max(0, target - Date.now());
  return {
    done: diff === 0,
    days: pad(Math.floor(diff / 86400000)),
    hours: pad(Math.floor((diff / 3600000) % 24)),
    minutes: pad(Math.floor((diff / 60000) % 60)),
    seconds: pad(Math.floor((diff / 1000) % 60)),
  };
};

const FlipCard = ({ value, big }) => (
  <div
    className={`relative bg-[#171717] border border-[#383838] flex items-center justify-center ${
      big ? 'rounded-lg p-4 sm:p-6 min-w-[170px] sm:min-w-[200px] shadow-[0_15px_30px_rgba(0,0,0,0.8)]' : 'rounded-md p-3 sm:p-4 w-full shadow-[0_10px_20px_rgba(0,0,0,0.7)]'
    }`}
  >
    <div className="absolute inset-x-0 top-1/2 h-[2px] bg-[#0c0c0c] z-10" />
    {big && ['top-2 left-2', 'top-2 right-2', 'bottom-2 left-2', 'bottom-2 right-2'].map((p) => (
      <div key={p} className={`absolute ${p} w-1.5 h-1.5 rounded-full bg-stone-600`} />
    ))}
    <span className={`font-bold font-mono text-[#d4af37] ${big ? 'text-5xl sm:text-7xl tracking-wider drop-shadow-[0_0_8px_rgba(212,175,55,0.6)]' : 'text-2xl sm:text-4xl'}`}>
      {value}
    </span>
  </div>
);

export default function CinemaCountdownSection() {
  const { config, setIsAudioPlaying } = useConfig();
  const cinema = config.cinema || {};
  const name = config.hero?.recipientName || config.clientName || '';
  const videoUrl = cinema.videoUrl || DEFAULT_VIDEO;
  const ytId = youtubeId(videoUrl);

  // ?premiere in the URL forces the reveal, so the owner can preview it before the date
  const forceReveal = typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('premiere');
  const target = cinema.targetDate ? new Date(cinema.targetDate).getTime() : Date.now() + 10 * 86400000;

  const [time, setTime] = useState(() => remaining(forceReveal ? 0 : target));
  const [inView, setInView] = useState(false);
  const [opened, setOpened] = useState(false);
  const [muted, setMuted] = useState(true);
  const sectionRef = useRef(null);
  const videoRef = useRef(null);
  const ytRef = useRef(null);

  useEffect(() => {
    if (forceReveal) return;
    const tick = () => setTime(remaining(target));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target, forceReveal]);

  // Only raise the curtain while someone is actually looking at the stage
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.45 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!time.done || !inView || opened) return;
    setOpened(true);
    const t1 = setTimeout(() => videoRef.current?.play().catch(() => {}), CURTAIN_MS * 0.6);
    const t2 = setTimeout(() => {
      confetti({ particleCount: 140, spread: 100, origin: { y: 0.55 }, colors: ['#fcd34d', '#f59e0b', '#dc2626', '#ffffff'] });
    }, CURTAIN_MS * 0.7);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [time.done, inView, opened]);

  const unmute = () => {
    setMuted(false);
    setIsAudioPlaying(false); // the background song steps aside for the premiere
    if (ytId) {
      ytCommand(ytRef.current, 'unMute');
      ytCommand(ytRef.current, 'setVolume', [100]);
      ytCommand(ytRef.current, 'playVideo');
      return;
    }
    if (videoRef.current) {
      videoRef.current.muted = false;
      videoRef.current.play().catch(() => {});
    }
  };

  const credits = {
    presents: cinema.creditPresents || 'A little production made with love',
    title: cinema.creditTitle || 'Happy Birthday',
  };

  const marquee = cinema.marqueeTapeText || 'SAVE THE DATE • OCTOBER 11 • SAVE THE DATE • OCTOBER 11 •';

  return (
    <section
      id="countdown"
      ref={sectionRef}
      className="relative min-h-screen bg-[#0b0708] text-amber-100 overflow-hidden select-none border-t border-b border-black flex flex-col"
    >
      {/* Marquee tape: two copies scrolling by -50% loop seamlessly */}
      <div className="relative z-40 w-full mt-16 border-y border-[#a87432]/60 bg-black/75 overflow-hidden shadow-[0_6px_20px_rgba(0,0,0,0.6)]">
        <div aria-hidden="true" className="marquee-bulbs mt-1" />
        <div className="flex w-max marquee-scroll py-1.5 text-[11px] sm:text-xs font-mono tracking-[0.3em] text-[#ffd98a] uppercase font-bold [text-shadow:0_0_8px_rgba(255,200,100,0.7)]">
          {[0, 1].map((k) => (
            <span key={k} aria-hidden={k === 1} className="pr-6 whitespace-nowrap">
              {marquee} {marquee}
            </span>
          ))}
        </div>
        <div aria-hidden="true" className="marquee-bulbs mb-1" />
      </div>

      {/* Stage: a dark auditorium, the glowing screen, and the projector beam */}
      <div className="absolute inset-0 flex flex-col items-center justify-center px-4 pt-36 pb-36 sm:pb-44 bg-[radial-gradient(ellipse_at_50%_40%,#22150f_0%,#0b0708_65%,#050304_100%)]">
        {/* Light the screen spills onto the room */}
        <div aria-hidden="true" className={`absolute left-1/2 top-[38%] -translate-x-1/2 -translate-y-1/2 w-[110%] h-[90%] rounded-[50%] bg-[radial-gradient(ellipse,rgba(255,215,160,0.16),transparent_60%)] transition-opacity duration-[2000ms] ${opened ? 'opacity-100' : 'opacity-0'}`} />

        {/* Projector beam from the booth behind the audience to the screen */}
        <div
          aria-hidden="true"
          className={`absolute inset-0 pointer-events-none mix-blend-screen transition-opacity duration-1000 ${opened ? 'opacity-100' : 'opacity-0'}`}
        >
          <div className="absolute inset-0 projector-beam [clip-path:polygon(50%_100%,47%_100%,8%_14%,92%_14%,53%_100%)] bg-[linear-gradient(to_top,rgba(255,236,200,0.22),rgba(255,226,180,0.04)_75%,transparent)]" />
          {[...Array(14)].map((_, i) => (
            <span
              key={i}
              className="absolute w-0.5 h-0.5 rounded-full bg-white/70 projector-dust"
              style={{ left: `${30 + ((i * 37) % 40)}%`, top: `${25 + ((i * 53) % 60)}%`, animationDelay: `${-(i * 1.3)}s`, animationDuration: `${7 + (i % 5)}s` }}
            />
          ))}
        </div>
        <div style={{ maxWidth: 'min(1024px, calc((100vh - 330px) * 16 / 9))' }} className="relative w-full aspect-video bg-black ring-1 ring-white/10 shadow-[0_0_120px_rgba(255,215,160,0.22),0_40px_80px_rgba(0,0,0,0.9)]">
          {ytId ? (
            opened && (
              <iframe
                ref={ytRef}
                className="absolute inset-0 w-full h-full"
                src={ytEmbed(ytId, { autoplay: '1', mute: '1', loop: '1', playlist: ytId, cc_load_policy: '0', iv_load_policy: '3' })}
                title="Birthday premiere"
                allow="autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
              />
            )
          ) : (
            <video ref={videoRef} src={videoUrl} className="absolute inset-0 w-full h-full object-cover" playsInline muted={muted} loop controls={opened} preload="metadata" />
          )}

          {/* Cinema treatment + opening credits, laid over the film (clicks pass through to the player) */}
          {opened && (
            <div aria-live="polite" className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="absolute inset-0 bg-black cinema-intro-dim" />
              <div className="absolute inset-0 shadow-[inset_0_0_120px_rgba(0,0,0,0.75)]" />
              <div className="absolute inset-0 film-grain-anim opacity-[0.07] mix-blend-overlay" />

              {/* Credit 1 */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 cinema-credit [animation-delay:2.8s]">
                <p className="font-sans text-[10px] sm:text-xs font-semibold uppercase tracking-[0.5em] text-[#e9cf9a]/80">{credits.presents}</p>
                <p className="mt-3 font-royal italic text-2xl sm:text-4xl text-[#fdf6e2]">presents</p>
              </div>

              {/* Credit 2: title card */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 cinema-credit cinema-credit-long [animation-delay:7s]">
                <span className="w-16 sm:w-24 h-px bg-gradient-to-r from-transparent via-[#e9cf9a] to-transparent" />
                <p className="mt-4 font-royal font-bold uppercase tracking-[0.2em] text-3xl sm:text-6xl text-[#fdf6e2] marquee-glow">{credits.title}</p>
                {name && <p className="mt-1 font-royal italic font-semibold text-5xl sm:text-8xl leading-none gold-shimmer-text">{name}</p>}
                <span className="mt-5 w-16 sm:w-24 h-px bg-gradient-to-r from-transparent via-[#e9cf9a] to-transparent" />
              </div>

              {/* Stays on: lower third + now-showing tag */}
              <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/70 to-transparent cinema-stay [animation-delay:13s]" />
              <div className="absolute left-[4%] bottom-[17%] cinema-stay [animation-delay:13.4s]">
                <p className="font-sans text-[9px] sm:text-[11px] font-semibold uppercase tracking-[0.4em] text-[#e9cf9a]/80">Starring</p>
                <p className="font-royal italic font-semibold text-2xl sm:text-4xl leading-tight text-[#fdf6e2]">{name || credits.title}</p>
              </div>
              <div className="absolute left-[4%] top-[6%] flex items-center gap-2 cinema-stay [animation-delay:13.8s]">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                <span className="font-sans text-[9px] sm:text-[11px] font-semibold uppercase tracking-[0.4em] text-[#fdf6e2]/85">{cinema.mainTitle || 'Now showing'}</span>
              </div>
            </div>
          )}

          {opened && muted && (
            <button
              onClick={unmute}
              className="absolute z-10 top-4 right-4 flex items-center gap-2 px-4 py-2 rounded-full bg-black/70 text-amber-100 text-xs font-semibold backdrop-blur hover:bg-black/90 transition"
            >
              <Volume2 className="w-4 h-4" /> Tap for sound
            </button>
          )}
        </div>

      </div>

      {/* Audience: two rows of seat-backs in front of everything once the show starts */}
      <div
        aria-hidden="true"
        className={`absolute inset-x-0 bottom-0 z-[35] pointer-events-none transition-all duration-[1500ms] ${opened ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
      >
        {[
          { n: 13, h: 'h-14 sm:h-20', w: 'w-[9%]', y: 'translate-y-2', shade: 'from-[#2a1416] to-[#120809]' },
          { n: 9, h: 'h-20 sm:h-28', w: 'w-[12.5%]', y: '', shade: 'from-[#1c0d0f] to-[#070304]' },
        ].map((row, r) => (
          <div key={r} className={`flex justify-center gap-[1%] -mx-[3%] ${r ? '-mt-8 sm:-mt-12' : ''} ${row.y}`}>
            {[...Array(row.n)].map((_, i) => (
              <span key={i} className={`${row.w} ${row.h} shrink-0 rounded-t-[45%] bg-gradient-to-b ${row.shade} shadow-[inset_0_6px_10px_rgba(255,210,160,0.08)]`} />
            ))}
          </div>
        ))}
      </div>

      {/* Curtains: gather to the sides when the time is up */}
      {['left', 'right'].map((side) => (
        <div
          key={side}
          aria-hidden="true"
          className={`absolute inset-y-0 z-20 w-[51%] ${side === 'left' ? 'left-0 origin-left' : 'right-0 origin-right'}`}
          style={{
            ...VELVET,
            transform: opened ? `scaleX(0.14) skewY(${side === 'left' ? 2 : -2}deg)` : 'none',
            transition: `transform ${CURTAIN_MS}ms cubic-bezier(0.7, 0, 0.25, 1)`,
          }}
        >
          {/* Gold fringe along the bottom hem */}
          <div className="absolute bottom-0 inset-x-0 h-3 bg-[repeating-linear-gradient(90deg,#d4a94a_0_3px,#8a6420_3px_6px)] opacity-90" />
          {/* Darker edge where the two halves meet */}
          <div className={`absolute inset-y-0 w-10 ${side === 'left' ? 'right-0 bg-gradient-to-l' : 'left-0 bg-gradient-to-r'} from-black/50 to-transparent`} />
        </div>
      ))}

      {/* Valance across the top, always in front */}
      <div aria-hidden="true" className="absolute top-0 inset-x-0 h-16 z-30" style={VELVET}>
        <div className="absolute -bottom-3 inset-x-0 h-4 bg-[radial-gradient(circle_at_50%_0,#7a1d24_11px,transparent_12px)] [background-size:24px_16px]" />
        <div className="absolute bottom-0 inset-x-0 h-1 bg-[#d4a94a]/70" />
      </div>

      {/* Countdown printed on the closed curtain; fades as it opens */}
      <div
        className={`relative z-30 flex-1 flex flex-col items-center justify-center text-center px-4 py-10 transition-opacity duration-700 ${opened ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
      >
        <div className="flex items-center gap-3 text-[#d99b26] mb-3">
          <span className="text-xl">✦</span>
          <span className="w-12 h-px bg-[#d99b26]/50" />
          <span className="text-xl">✦</span>
        </div>
        <h2 className="font-royal font-bold uppercase tracking-[0.08em] text-5xl sm:text-6xl lg:text-7xl leading-[0.95] text-[#fdf6e2] marquee-glow">
          {cinema.mainTitle || 'NOW SHOWING'}
        </h2>
        <p className="mt-5 text-sm sm:text-base leading-relaxed text-[#e9cf9a]">
          {cinema.subtitle || 'a little production, live October 11th'}
        </p>

        <div className="mt-12 flex flex-col items-center gap-6 w-full max-w-md">
          <div className="flex flex-col items-center">
            <FlipCard value={time.days} big />
            <span className="font-sans text-[11px] font-semibold uppercase tracking-[0.25em] text-[#d4af37]/80 mt-2">Days to curtain</span>
          </div>
          <div className="grid grid-cols-3 gap-3 sm:gap-5 w-full">
            {[['hours', 'HRS'], ['minutes', 'MIN'], ['seconds', 'SEC']].map(([k, label]) => (
              <div key={k} className="flex flex-col items-center">
                <FlipCard value={time[k]} />
                <span className="font-sans text-[10px] font-semibold uppercase tracking-[0.25em] text-[#d4af37]/70 mt-1.5">{label}</span>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={() => confetti({ particleCount: 120, spread: 90, origin: { y: 0.6 }, colors: ['#fcd34d', '#f59e0b', '#dc2626', '#ffffff'] })}
          className="mt-10 px-6 py-2.5 rounded-full border border-[#d4af37]/60 bg-black/50 hover:bg-[#d4af37] hover:text-stone-900 text-[#d4af37] font-semibold text-xs tracking-widest uppercase transition-all duration-300 shadow-lg hover:scale-105 active:scale-95"
        >
          Pop Birthday Sparkles ✨
        </button>
      </div>

      <div className={`relative z-30 w-full text-center pb-6 pt-4 border-t border-[#a87432]/30 transition-opacity duration-700 ${opened ? 'opacity-0' : ''}`}>
        <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.35em] text-[#d4af37]/80">{cinema.footerText || 'DOORS OPEN AT MIDNIGHT, IST'}</p>
      </div>
    </section>
  );
}

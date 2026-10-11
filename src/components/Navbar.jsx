import React, { useRef, useState, useEffect } from 'react';
import { useConfig } from '../config/ConfigContext';
import confetti from 'canvas-confetti';
import { Volume2, VolumeX, Music, Sparkles, Sliders, Share2, Check } from 'lucide-react';
import { clientPresets } from '../config/clientPresets';
import { youtubeId, ytEmbed, ytCommand } from '../youtube';

export default function Navbar() {
  const { config, isAdmin, isAudioPlaying, setIsAudioPlaying, setIsStudioOpen, loadPreset, generateShareableLink } = useConfig();
  const audioRef = useRef(null);
  const ytRef = useRef(null);
  const [copied, setCopied] = useState(false);
  const songUrl = config.music?.audioUrl || "https://assets.mixkit.co/music/preview/mixkit-romantic-moment-1144.mp3";
  const ytId = youtubeId(songUrl);
  const [ytMounted, setYtMounted] = useState(false); // YouTube player loads on the first play tap

  // YouTube song: first play mounts the player (autoplay=1, allowed by that tap); later toggles use the API
  useEffect(() => {
    if (!ytId) return;
    if (isAudioPlaying && !ytMounted) setYtMounted(true);
    else if (ytMounted) ytCommand(ytRef.current, isAudioPlaying ? 'playVideo' : 'pauseVideo');
  }, [isAudioPlaying, ytId]);

  // A new song link replaces the player
  useEffect(() => setYtMounted(false), [ytId]);

  // Initialize or handle audio
  useEffect(() => {
    if (ytId) return;
    if (audioRef.current) {
      if (isAudioPlaying) {
        audioRef.current.play().catch(() => {
          // Browser autoplay restriction handling
          setIsAudioPlaying(false);
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [isAudioPlaying, ytId]);

  const toggleAudio = () => {
    setIsAudioPlaying(!isAudioPlaying);
  };

  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.2 },
      colors: ['#e0a955', '#e11d48', '#f43f5e', '#fbbf24', '#ffffff']
    });
  };

  const handleCopyLink = () => {
    const link = generateShareableLink();
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  return (
    <>
      {ytId ? (
        /* YouTube song: small visible "now playing" player (YouTube requires the player to be visible) */
        ytMounted && (
          <div
            className={`fixed bottom-4 left-4 z-40 w-48 sm:w-56 rounded-xl overflow-hidden bg-black shadow-2xl ring-1 ring-white/20 transition-all duration-300 ${
              isAudioPlaying ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
            }`}
          >
            <iframe
              ref={ytRef}
              className="w-full aspect-video block"
              src={ytEmbed(ytId, { autoplay: '1', loop: '1', playlist: ytId, controls: '1' })}
              title="Our song"
              allow="autoplay; encrypted-media"
            />
          </div>
        )
      ) : (
        /* Hidden audio element with user-configured URL */
        <audio ref={audioRef} src={songUrl} loop preload="auto" />
      )}

      <header className="fixed top-0 left-0 right-0 z-40 px-4 py-3 pointer-events-none">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Left: Client Name Pill / Client Switcher */}
          <div className="pointer-events-auto flex items-center gap-2">
            {isAdmin && (
            <div className="flex items-center gap-2 bg-white/80 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-stone-200/80 shadow-sm text-xs font-medium text-stone-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Client:</span>
              <select
                aria-label="Select client preset"
                value={config.id || 'sana'}
                onChange={(e) => loadPreset(e.target.value)}
                className="bg-transparent text-stone-900 font-semibold cursor-pointer outline-none border-none py-0 pr-1 text-xs"
              >
                <option value="sana">Sana (Screenshot Default)</option>
                <option value="maya">Maya (Romantic Pink)</option>
                <option value="liam">Liam (Modern Royal)</option>
              </select>
            </div>
            )}

            <button
              onClick={triggerConfetti}
              title="Pop Confetti"
              className="hidden sm:flex items-center gap-1.5 bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-stone-200/80 shadow-sm text-xs font-semibold text-rose-600 hover:bg-rose-50 hover:scale-105 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Celebrate</span>
            </button>
          </div>

          {/* Right: Audio control, Share Link & Seller Studio Drawer Toggle */}
          <div className="pointer-events-auto flex items-center gap-2">
            
            {/* Music Player */}
            <button
              onClick={toggleAudio}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium backdrop-blur-md border transition-all ${
                isAudioPlaying 
                  ? 'bg-amber-100/90 text-amber-900 border-amber-300 shadow-sm ring-2 ring-amber-400/30' 
                  : 'bg-white/80 text-stone-600 border-stone-200/80 hover:bg-white shadow-sm'
              }`}
              title={isAudioPlaying ? "Mute Background Music" : "Play Romantic Background Music"}
            >
              {isAudioPlaying ? (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-amber-700 animate-bounce" />
                  <span className="hidden md:inline font-semibold">Playing Song</span>
                  <span className="flex gap-0.5 items-end h-3">
                    <span className="w-0.5 bg-amber-600 h-2 animate-pulse"></span>
                    <span className="w-0.5 bg-amber-600 h-3 animate-ping"></span>
                    <span className="w-0.5 bg-amber-600 h-1.5 animate-pulse"></span>
                  </span>
                </>
              ) : (
                <>
                  <VolumeX className="w-3.5 h-3.5 text-stone-400" />
                  <span className="hidden md:inline">Play Song</span>
                </>
              )}
            </button>

            {/* Owner-only: share link + studio */}
            {isAdmin && (<>
            <button
              onClick={handleCopyLink}
              title="Copy shareable link for this client"
              className="flex items-center gap-1.5 bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-stone-200/80 shadow-sm text-xs font-semibold text-stone-700 hover:bg-stone-50 transition-all"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-bold">Link Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-stone-500" />
                  <span className="hidden sm:inline">Share Link</span>
                </>
              )}
            </button>

            {/* Seller Customizer Button */}
            <button
              onClick={() => setIsStudioOpen(true)}
              className="flex items-center gap-1.5 bg-gradient-to-r from-stone-900 to-stone-800 text-amber-300 px-3.5 py-1.5 rounded-full text-xs font-bold shadow-md hover:shadow-lg hover:from-black hover:to-stone-900 transition-all ring-1 ring-amber-400/30"
              title="Open Client Studio to customize & export for any buyer"
            >
              <Sliders className="w-3.5 h-3.5 text-amber-400" />
              <span>Customize Site</span>
            </button>
            </>)}

          </div>
        </div>
      </header>
    </>
  );
}

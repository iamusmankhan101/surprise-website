// Default client configuration matching the screenshot preview
export const defaultConfig = {
  id: "client-sana",
  clientName: "Sana",
  birthDateLabel: "OCT 2",
  tagline: "MADE FOR YOU",
  hero: {
    titlePrefix: "Happy",
    titleMain: "Birthday",
    recipientName: "Sana",
    highlightColor: "#d99b26", // mustard gold from screenshot 1
    fontTheme: "royal-garamond", // matches the site-wide Cormorant headings; others: "syne-couture" | "vogue-editorial" | "paris-romance"
    message: "wishing you a day filled with love, laughter, and all the happiness your heart can hold. May this year bring you endless joy and unforgettable memories. Happy Birthday!",
    audioButtonLabel: "Tap to play our song 🎵",
    // 18 photos curated to create the curved filmstrip ribbon
    ribbonPhotos: [
      { id: 1, url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80", alt: "Memory 1" },
      { id: 2, url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80", alt: "Memory 2" },
      { id: 3, url: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&auto=format&fit=crop&q=80", alt: "Memory 3" },
      { id: 4, url: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80", alt: "Memory 4" },
      { id: 5, url: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&auto=format&fit=crop&q=80", alt: "Memory 5" },
      { id: 6, url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80", alt: "Memory 6" },
      { id: 7, url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80", alt: "Memory 7" },
      { id: 8, url: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=400&auto=format&fit=crop&q=80", alt: "Memory 8" },
      { id: 9, url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80", alt: "Memory 9" },
      { id: 10, url: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&auto=format&fit=crop&q=80", alt: "Memory 10" },
      { id: 11, url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80", alt: "Memory 11" },
      { id: 12, url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80", alt: "Memory 12" },
      { id: 13, url: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&auto=format&fit=crop&q=80", alt: "Memory 13" },
      { id: 14, url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80", alt: "Memory 14" },
      { id: 15, url: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80", alt: "Memory 15" },
      { id: 16, url: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=400&auto=format&fit=crop&q=80", alt: "Memory 16" },
      { id: 17, url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80", alt: "Memory 17" },
      { id: 18, url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80", alt: "Memory 18" },
    ]
  },
  // Polaroid gallery section matching Screenshot 2
  polaroids: [
    {
      id: "p1",
      url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80",
      caption: "Cutie",
      emoji: "🥺",
      rotation: -6,
      pinEmoji: "❤️",
      note: "Your smile lights up my whole universe."
    },
    {
      id: "p2",
      url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500&auto=format&fit=crop&q=80",
      caption: "Baddie",
      emoji: "😎",
      rotation: 4,
      pinEmoji: "❤️",
      note: "Unmatched confidence and that effortless vibe."
    },
    {
      id: "p3",
      url: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=500&auto=format&fit=crop&q=80",
      caption: "Pretty",
      emoji: "✨",
      rotation: -3,
      pinEmoji: "❤️",
      note: "Genuinely the most gorgeous soul I know."
    },
    {
      id: "p4",
      url: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=500&auto=format&fit=crop&q=80",
      caption: "My Love",
      emoji: "🥰",
      rotation: 7,
      pinEmoji: "❤️",
      note: "Every moment with you feels like home."
    },
    {
      id: "p5",
      url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&auto=format&fit=crop&q=80",
      caption: "Dream Girl",
      emoji: "💫",
      rotation: -5,
      pinEmoji: "❤️",
      note: "Still pinch myself every day that you are real."
    },
    {
      id: "p6",
      url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&auto=format&fit=crop&q=80",
      caption: "Queen",
      emoji: "👑",
      rotation: 2,
      pinEmoji: "❤️",
      note: "Ruling every room you walk into with grace."
    },
    {
      id: "p7",
      url: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=500&auto=format&fit=crop&q=80",
      caption: "Sunshine",
      emoji: "☀️",
      rotation: -8,
      pinEmoji: "❤️",
      note: "Always bringing warmth wherever you go."
    },
    {
      id: "p8",
      url: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=500&auto=format&fit=crop&q=80",
      caption: "My Favorite",
      emoji: "🦋",
      rotation: 5,
      pinEmoji: "❤️",
      note: "Forever and always my favorite person."
    }
  ],
  // iPhone iMessage Chat section matching Screenshot 3
  chat: {
    contactName: "Sweet Sana",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
    status: "iMessage • online now",
    timeLabel: "TODAY 6:10 PM",
    readReceipt: "Read 6:10 pm",
    messages: [
      {
        id: "m1",
        text: "Happpyyeee birthday love,",
        reaction: null,
      },
      {
        id: "m2",
        text: "I wanted this one to be extra special,",
        reaction: null,
      },
      {
        id: "m3",
        text: "so I made you a little something,",
        reaction: null,
      },
      {
        id: "m4",
        text: "i hope it puts the biggest smile on your face 🥹",
        reaction: null,
      },
      {
        id: "m5",
        text: "Happpyyeee birthday love 🫂",
        reaction: "❤️",
      }
    ]
  },
  // Vintage Theater "NOW SHOWING" Countdown matching Screenshot 4
  cinema: {
    marqueeTapeText: "SAVE THE DATE • OCTOBER 11 • SAVE THE DATE • OCTOBER 11 • SAVE THE DATE • OCTOBER 11 • SAVE THE DATE • OCTOBER 11 •",
    mainTitle: "NOW SHOWING",
    subtitle: "a little production, live October 11th",
    footerText: "DOORS OPEN AT MIDNIGHT, IST",
    targetDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000 + 7 * 60 * 60 * 1000 + 46 * 60 * 1000).toISOString(),
    eventDateDisplay: "OCTOBER 11"
  },
  // Background music & celebration vibes
  music: {
    songTitle: "Golden Hour - Acoustic Lofi",
    audioUrl: "https://assets.mixkit.co/music/preview/mixkit-romantic-moment-1144.mp3",
    autoPlayPrompt: true
  },
  footer: {
    madeWithLoveBy: "Crafted with love for your special day",
    year: "2026"
  }
};

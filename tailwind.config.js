/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        vintage: {
          red: '#841f27',
          darkred: '#5c141a',
          gold: '#e0a955',
          cream: '#f7f4ed',
          border: '#3a2022',
        },
        chat: {
          dark: '#0f0f11',
          card: '#1c1c1e',
          bubble: '#e59556',
          bubbleText: '#2b1704',
          bubbleDark: '#262629'
        }
      },
      fontFamily: {
        serif: ['Cormorant Garamond', 'Georgia', 'serif'],
        display: ['Cinzel', 'Playfair Display', 'serif'],
        luxury: ['Italiana', 'serif'],
        royal: ['Cormorant Garamond', 'serif'],
        couture: ['Bodoni Moda', 'serif'],
        script: ['Alex Brush', 'cursive'],
        syne: ['Syne', 'sans-serif'],
        handwriting: ['Caveat', 'cursive'],
        marker: ['Chewy', 'cursive'],
        mono: ['Courier Prime', 'monospace'],
      },
      keyframes: {
        flipDown: {
          '0%': { transform: 'rotateX(0deg)' },
          '100%': { transform: 'rotateX(-180deg)' }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' }
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.8', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.05)' }
        },
        blink: {
          '0%, 45%, 100%': { opacity: '1' },
          '55%, 80%': { opacity: '0.12' }
        },
        skyRotate: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' }
        },
        shoot: {
          '0%': { opacity: '0', transform: 'translateX(0)' },
          '2%': { opacity: '1' },
          '9%': { opacity: '0', transform: 'translateX(520px)' },
          '100%': { opacity: '0', transform: 'translateX(520px)' }
        },
        moonGlow: {
          '0%, 100%': { opacity: '0.65', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.15)' }
        },
        drift: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '50%': { transform: 'translate(60px, 40px) scale(1.15)' }
        },
        songProgress: {
          '0%': { width: '0%' },
          '100%': { width: '100%' }
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' }
        },
        sway: {
          '0%, 100%': { transform: 'rotate(-2.5deg)' },
          '50%': { transform: 'rotate(2.5deg)' }
        },
        popIn: {
          '0%': { opacity: '0', transform: 'scale(0.85) translateY(8px)' },
          '100%': { opacity: '1', transform: 'scale(1) translateY(0)' }
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        }
      },
      animation: {
        float: 'float 4s ease-in-out infinite',
        pulseGlow: 'pulseGlow 2.5s ease-in-out infinite',
        blink: 'blink 2.4s ease-in-out infinite',
        'sky-rotate': 'skyRotate 600s linear infinite',
        shoot: 'shoot 9s ease-out infinite',
        'moon-glow': 'moonGlow 6s ease-in-out infinite',
        drift: 'drift 24s ease-in-out infinite',
        sway: 'sway 5s ease-in-out infinite',
        marquee: 'marquee 40s linear infinite',
        'pop-in': 'popIn 0.4s cubic-bezier(0.34, 1.4, 0.64, 1) both',
        'fade-up': 'fadeUp 0.8s cubic-bezier(0.22, 1, 0.36, 1) backwards'
      }
    },
  },
  plugins: [],
};

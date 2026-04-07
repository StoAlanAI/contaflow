import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        playfair: ['var(--font-playfair)', 'Georgia', 'serif'],
        sans: ['var(--font-dm-sans)', 'sans-serif'],
        mono: ['var(--font-ibm-mono)', 'monospace'],
      },
      colors: {
        gold: {
          DEFAULT: '#C49A3C',
          light: '#D4AF5A',
          dark: '#A07D28',
          muted: 'rgba(196,154,60,0.15)',
        },
        ink: {
          950: '#06080D',
          900: '#080A0F',
          800: '#0C0F16',
          700: '#111520',
          600: '#161B28',
          500: '#1E2535',
        },
        surface: {
          DEFAULT: 'rgba(14,17,26,0.85)',
          hover: 'rgba(22,27,40,0.9)',
        },
        income: '#22C55E',
        expense: '#EF4444',
      },
      backgroundImage: {
        'grain': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E\")",
      },
      animation: {
        'fade-up': 'fadeUp 0.5s ease-out forwards',
        'fade-in': 'fadeIn 0.4s ease-out forwards',
        'shimmer': 'shimmer 2s infinite',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
}

export default config

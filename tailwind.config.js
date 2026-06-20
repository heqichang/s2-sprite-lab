/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      fontFamily: {
        pixel: ['"Press Start 2P"', 'monospace'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        'game-bg': '#0f0a1e',
        'game-card': '#1a1333',
        'game-border': '#2d1f5e',
        'neon-purple': '#a855f7',
        'neon-blue': '#3b82f6',
        'neon-cyan': '#06b6d4',
        'neon-pink': '#ec4899',
        'neon-amber': '#f59e0b',
        'neon-green': '#10b981',
      },
      boxShadow: {
        'neon-purple': '0 0 5px #a855f7, 0 0 10px #a855f7, 0 0 20px rgba(168, 85, 247, 0.4)',
        'neon-blue': '0 0 5px #3b82f6, 0 0 10px #3b82f6, 0 0 20px rgba(59, 130, 246, 0.4)',
        'neon-cyan': '0 0 5px #06b6d4, 0 0 10px #06b6d4, 0 0 20px rgba(6, 182, 212, 0.4)',
        'neon-amber': '0 0 5px #f59e0b, 0 0 10px #f59e0b, 0 0 20px rgba(245, 158, 11, 0.4)',
      },
      animation: {
        'pulse-neon': 'pulse-neon 2s ease-in-out infinite',
        'scanline': 'scanline 6s linear infinite',
        'float': 'float 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        'pulse-neon': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        'scanline': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'glow': {
          '0%': { boxShadow: '0 0 5px currentColor' },
          '100%': { boxShadow: '0 0 10px currentColor, 0 0 20px currentColor, 0 0 30px currentColor' },
        },
      },
    },
  },
  plugins: [],
};

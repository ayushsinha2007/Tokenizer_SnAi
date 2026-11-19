/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'lab-bg': '#080F1E',
        'lab-surface': '#111C30',
        'lab-card': '#142137',
        'lab-border': 'rgba(57, 139, 255, 0.18)',
        'lab-border-subtle': 'rgba(255, 255, 255, 0.08)',
        'lab-blue': '#398BFF',
        'lab-cyan': '#62C9F5',
        'lab-glow': 'rgba(57, 139, 255, 0.25)',
        'lab-text': '#F1F5FC',
        'lab-muted': '#9AAAC0',
        'lab-accent': '#FF7A45',
        'lab-success': '#2DD4BF',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        'spin-slow': 'spin 24s linear infinite',
        'spin-reverse': 'spin-reverse 32s linear infinite',
        'pulse-glow': 'pulse-glow 4s ease-in-out infinite',
      },
      keyframes: {
        'spin-reverse': {
          from: { transform: 'rotate(360deg)' },
          to: { transform: 'rotate(0deg)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.05)' },
        }
      }
    },
  },
  plugins: [],
}

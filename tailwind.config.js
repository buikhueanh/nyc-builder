/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        'grass-green': '#1a7a1a',
        'pitch-white': '#f8f8f2',
        'night-black': '#0d0d0d',
        'amber-goal': '#f5a623',
        'card-surface': '#ffffff',
        'border-subtle': '#e2e2e2',
        'vibe-red': '#e63946',
        'vibe-blue': '#457b9d',
      },
      fontFamily: {
        display: ['"Bebas Neue"', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"Space Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
}

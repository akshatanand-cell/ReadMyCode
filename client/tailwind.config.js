/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#070A12',
        card: '#0F172A',
        primary: '#6366F1',
        secondary: '#0EA5E9',
        accent: '#A855F7',
        success: '#10B981',
        error: '#F43F5E',
        warning: '#F59E0B',
        'background-secondary': '#1E293B',
        'border': 'rgba(255, 255, 255, 0.08)',
        'border-light': 'rgba(255, 255, 255, 0.15)',
        'text-primary': '#F8FAFC',
        'text-secondary': '#94A3B8',
        'text-muted': '#64748B',
        'primary-hover': '#4F46E5',
        'success-hover': '#059669',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'glow': '0 0 25px rgba(99, 102, 241, 0.2)',
        'glow-lg': '0 0 50px rgba(99, 102, 241, 0.3)',
        'card-glow': '0 10px 30px -10px rgba(99, 102, 241, 0.15)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
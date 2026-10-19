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
        background: 'rgb(var(--color-bg) / <alpha-value>)',
        'background-secondary': 'rgb(var(--color-bg-subtle) / <alpha-value>)',
        card: 'rgb(var(--color-card) / <alpha-value>)',
        primary: 'rgb(var(--color-primary) / <alpha-value>)',
        'primary-hover': 'rgb(var(--color-primary-hover) / <alpha-value>)',
        secondary: '#0EA5E9',
        accent: 'rgb(var(--color-accent) / <alpha-value>)',
        success: '#10B981',
        error: '#F43F5E',
        warning: '#F59E0B',
        border: 'rgb(var(--color-border) / <alpha-value>)',
        'border-light': 'rgb(var(--color-border-light) / <alpha-value>)',
        'text-primary': 'rgb(var(--color-text-primary) / <alpha-value>)',
        'text-secondary': 'rgb(var(--color-text-secondary) / <alpha-value>)',
        'text-muted': 'rgb(var(--color-text-muted) / <alpha-value>)',
        'success-hover': '#059669',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', '"Noto Sans"', '"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
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
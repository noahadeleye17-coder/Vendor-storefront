/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        ink: 'var(--color-ink)',
        paper: 'var(--color-paper)',
        jade: {
          DEFAULT: 'var(--color-jade)',
          light: 'var(--color-jade-light)',
        },
        marigold: 'var(--color-marigold)',
        onMarigold: 'var(--color-on-marigold)',
        onLight: 'var(--color-on-light)',
        line: 'var(--color-line)',
      },
      fontFamily: {
        display: ['var(--font-display)', 'sans-serif'],
        body: ['var(--font-body)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      borderRadius: {
        xl: '1.25rem',
        '2xl': '1.75rem',
      },
      boxShadow: {
        soft: '0 20px 60px -20px rgba(15, 42, 36, 0.25)',
        card: '0 8px 30px -12px rgba(15, 42, 36, 0.18)',
      },
    },
  },
  plugins: [],
};
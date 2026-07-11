/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        // "Annotated manuscript" palette — a scholar's marked-up transcript,
        // not a generic SaaS dashboard. Named for what they mark, not tone.
        paper: '#F7F3EA',
        'paper-raised': '#FFFDF8',
        ink: '#1F2421',
        'ink-muted': '#5B5F58',
        'ink-faint': '#8B8F86',
        amber: {
          DEFAULT: '#C97A2B',
          light: '#F3DDBE',
          dark: '#9C5E1F',
        },
        teal: {
          DEFAULT: '#2F6E62',
          light: '#D9EAE6',
          dark: '#204A42',
        },
        rose: {
          DEFAULT: '#B33A3A',
          light: '#F2D9D9',
        },
        hairline: '#D8D0BF',
      },
      fontFamily: {
        // 'Noto Nastaliq Urdu' trails each stack: Latin text never reaches it,
        // but Urdu glyphs fall through to it (per-glyph font fallback), so
        // code-mixed transcripts render both scripts correctly.
        // Serif display face for headings — academic, characterful.
        display: ['"Fraunces"', 'ui-serif', 'Georgia', '"Noto Nastaliq Urdu"', 'serif'],
        // Humanist sans for UI chrome and body copy.
        sans: ['"Public Sans"', 'ui-sans-serif', 'system-ui', '-apple-system', '"Noto Nastaliq Urdu"', 'sans-serif'],
        // Monospace for timestamps, tags, annotation labels — a nod to corpus markup.
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', '"Noto Nastaliq Urdu"', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 2px 0 rgba(31,36,33,0.06), 0 1px 3px 0 rgba(31,36,33,0.08)',
        'card-lifted': '0 4px 10px -2px rgba(31,36,33,0.12), 0 2px 4px -2px rgba(31,36,33,0.08)',
        index: '2px 3px 6px 0 rgba(31,36,33,0.18)',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(-4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}

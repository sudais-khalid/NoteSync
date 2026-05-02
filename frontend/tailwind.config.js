/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        // Claude-inspired warm neutral palette
        claude: {
          bg: '#f8f7f4',       // warm off-white page background
          surface: '#ffffff',  // card / panel surfaces
          border: '#e5e3de',   // subtle warm-grey borders
          orange: '#d97757',   // primary accent (Claude brand)
          'orange-dark': '#c4673f', // hover state for orange
          'orange-light': '#fdf0eb', // very light orange tint
          dark: '#1a1a1a',     // primary text
          muted: '#6b6b6b',    // secondary text
          subtle: '#9a9a9a',   // placeholder / disabled text
          'dark-surface': '#2d2d2d', // dark card (login header etc.)
          'dark-bg': '#1a1a1a',      // full dark sections
        },
        // Legacy primary kept for any unreachable references
        primary: {
          50: '#fdf0eb',
          100: '#fae0d3',
          200: '#f5c1a7',
          300: '#eda07a',
          400: '#e4804e',
          500: '#d97757',
          600: '#c4673f',
          700: '#a5532e',
          800: '#86421f',
          900: '#663213',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-down': 'slideDown 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(-4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      boxShadow: {
        'claude': '0 1px 3px 0 rgba(0,0,0,0.07), 0 1px 2px -1px rgba(0,0,0,0.05)',
        'claude-md': '0 4px 12px 0 rgba(0,0,0,0.08), 0 2px 4px -1px rgba(0,0,0,0.04)',
        'claude-lg': '0 8px 24px 0 rgba(0,0,0,0.10), 0 4px 8px -2px rgba(0,0,0,0.06)',
      }
    },
  },
  plugins: [],
}
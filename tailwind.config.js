/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Dark Blue Shiny Theme Colors
        'deep-blue': '#0F172A',      // Darkest blue background
        'dark-blue': '#1E293B',      // Dark blue for cards
        'medium-blue': '#334155',    // Medium blue for borders
        'light-blue': '#475569',     // Light blue for text
        'accent-blue': '#3B82F6',    // Bright blue for accents
        'electric-blue': '#06B6D4',  // Electric blue for highlights
        'neon-blue': '#0EA5E9',      // Neon blue for buttons
        'ice-blue': '#E0F2FE',       // Very light blue for text
        'silver': '#F1F5F9',         // Silver for primary text
        'charcoal': '#000000',       // Pure black for shadings only
        
        // Legacy colors for compatibility
        primary: '#3B82F6',
        'primary-hover': '#2563EB',
        secondary: '#475569',
      },
      fontFamily: {
        sans: [
          'Inter Variable',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'Noto Sans',
          'sans-serif',
        ],
      },
      spacing: {
        section: '2rem',
      },
      borderRadius: {
        container: '0.75rem',
      },
      animation: {
        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ping': 'ping 1s cubic-bezier(0, 0, 0.2, 1) infinite',
        'spin': 'spin 1s linear infinite',
      },
      backdropBlur: {
        'xs': '2px',
        'sm': '4px',
        'md': '12px',
        'lg': '16px',
        'xl': '24px',
      },
      boxShadow: {
        'glow': '0 0 20px rgba(245, 158, 11, 0.3)',
        'glow-lg': '0 0 40px rgba(245, 158, 11, 0.4)',
      },
    },
  },
  plugins: [],
}

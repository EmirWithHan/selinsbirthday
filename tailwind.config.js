/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Playfair Display', 'Georgia', 'serif'],
      },
      colors: {
        ink: '#080A1F',
        midnight: '#101236',
        plum: '#261646',
        roseglow: '#FF8FB8',
        champagne: '#FFE0C7',
      },
      boxShadow: {
        glow: '0 0 45px rgba(255, 143, 184, 0.28)',
        glass: '0 20px 70px rgba(0, 0, 0, 0.35)',
      },
    },
  },
  plugins: [],
};

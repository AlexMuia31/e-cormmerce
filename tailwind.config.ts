import type {Config} from 'tailwindcss';

export default {
  darkMode: 'class',
  content: ['./app/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: '#1A2A3A',
          cream: '#F5f2EA',
          gold: '#C3A343',
          gray: '#8C8C8C',
        },
      },
      fontFamily: {
        playfair: ['Playfair Display', 'serif'],
        source: ['Source Sans Pro', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config;

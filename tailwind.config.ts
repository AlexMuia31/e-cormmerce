import type {Config} from 'tailwindcss';

export default <Config>{
  darkMode: 'class',
  content: ['./app/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: '#D4AF37',
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
};

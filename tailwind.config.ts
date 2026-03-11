import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#0f766e',
        accent: '#f59e0b',
      },
    },
  },
  plugins: [],
};

export default config;

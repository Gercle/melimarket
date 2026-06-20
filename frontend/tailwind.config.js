/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        meli: {
          yellow: '#FFE600',
          blue: '#3483FA',
          dark: '#2D3277',
          green: '#39B54A',
        },
      },
    },
  },
  plugins: [],
}

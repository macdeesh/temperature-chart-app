// FILE: tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#E8F4FD',
          100: '#D1E9FB', 
          500: '#45B7D1',
          600: '#3A9BC1',
          700: '#2E7A9A'
        },
        accent: {
          500: '#4ECDC4',
          600: '#42A69F'
        }
      }
    },
  },
  plugins: [],
}
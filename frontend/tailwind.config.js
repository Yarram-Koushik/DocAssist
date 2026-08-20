/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2563eb',
          dark: '#1d4ed8',
        },
        accent: '#14b8a6',
        background: {
          light: '#f9fafb',
          dark: '#111827',
        },
        card: {
          light: '#ffffff',
          dark: '#1f2937',
        }
      }
    },
  },
  plugins: [],
}

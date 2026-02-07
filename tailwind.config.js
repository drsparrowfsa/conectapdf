
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
      },
      colors: {
        primary: '#6A5ACD',
        secondary: '#7B68EE',
        accent: '#EE82EE',
      }
    },
  },
  plugins: [],
}

const colors = require("tailwindcss/colors");

/** @type {import('tailwindcss').Config} */
module.exports = {
  // Rutas a todos los archivos que usan clases Tailwind/NativeWind
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./constants/**/*.{js,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: colors.indigo,
        neutral: colors.gray,
      },
      fontFamily: {
        sans: ["System"],
      },
    },
  },
  plugins: [],
}
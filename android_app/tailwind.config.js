/** @type {import('tailwindcss').Config} */
module.exports = {
  // Catching both standalone root entry files and nested Expo Router files
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {},
  },
  plugins: [],
}

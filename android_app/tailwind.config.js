/** @type {import('tailwindcss').Config} */
module.exports = {
  // Catching both standalone root entry files and nested Expo Router files
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Ubuntu_400Regular"],
      },
      colors: {
        brand: {
          navy: "#0B2E4F",
          navyDark: "#061A30",
          teal: "#1FB6D4",
          tealLight: "#5FD8E8",
        },
        surface: {
          DEFAULT: "rgb(var(--color-surface) / <alpha-value>)",
          muted: "rgb(var(--color-surface-muted) / <alpha-value>)",
          app: "rgb(var(--color-surface-app) / <alpha-value>)",
        },
        ink: {
          DEFAULT: "rgb(var(--color-ink) / <alpha-value>)",
          soft: "rgb(var(--color-ink-soft) / <alpha-value>)",
          faint: "rgb(var(--color-ink-faint) / <alpha-value>)",
        },
        line: "rgb(var(--color-line) / <alpha-value>)",
        status: {
          success: "#22C55E",
          danger: "#EF4444",
          warning: "#F59E0B",
        },
      },
      borderRadius: {
        xl2: "20px",
        xl3: "28px",
      },
    },
  },
  plugins: [],
}

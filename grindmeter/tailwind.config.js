/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        customGreen: {
          100: "#23a946",
          200: "#136929",
          300: "#0c4019",
        },
        customBlack: {
          100: "#1d1d1d",
          200: "#3d3d3d",
          300: "#5d5d5d",
          400: "#d8d8d8",
          500: "#121212",
        },
      },
      keyframes: {
        shine: {
          "0%": { "background-position": "100%" },
          "100%": { "background-position": "-100%" },
        },
        phosphor: {
          "0%, 91%, 93.5%, 96.5%, 100%": { opacity: "1" },
          "92%": { opacity: "0.82" },
          "95%": { opacity: "0.9" },
        },
      },
      animation: {
        shine: "shine 5s linear infinite",
        phosphor: "phosphor 7s linear infinite",
      },
    },
  },
  plugins: [],
};

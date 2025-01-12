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
        },
      },
    },
  },
  plugins: [],
};

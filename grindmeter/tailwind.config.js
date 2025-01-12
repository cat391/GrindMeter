/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        customGreen: {
          100: "#23a946",
          200: "#303030",
          300: "#5d5d5d",
        },
        customBlack: {
          100: "#1d1d1d",
          200: "#272727",
          300: "#747474",
        },
      },
    },
  },
  plugins: [],
};

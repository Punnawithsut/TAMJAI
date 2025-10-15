/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        CBlue: "#1800ad",
        CGrey: "#f1f1f1",
        CWhite: "#ffffff",
        CBlack: "#000000",
      },
    },
  },
  plugins: [],
};

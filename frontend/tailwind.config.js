/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ifverde: "#1B5E20",
        ifverdeclaro: "#2E7D32",
        ifvermelho: "#C62828",
      },
    },
  },
  plugins: [],
};

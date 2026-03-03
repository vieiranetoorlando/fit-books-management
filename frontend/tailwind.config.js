/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: "#1a2e4c",
          purple: "#6366f1",
          gray: "#f3f4f6",
          text: "#374151",
        }
      }
    },
  },
  plugins: [],
}
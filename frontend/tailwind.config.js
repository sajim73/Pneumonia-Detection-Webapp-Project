/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#0f766e",
        secondary: "#1e293b",
        accent: "#f59e0b"
      }
    }
  },
  plugins: []
};

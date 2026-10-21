/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        darkbg: "#0B0F19",
        cardbg: "#111827",
        bordercol: "#1F2937",
        primaryblue: "#3B82F6",
        secondarygreen: "#10B981",
        accentpurple: "#8B5CF6",
        goldamber: "#F59E0B"
      }
    },
  },
  plugins: [],
}

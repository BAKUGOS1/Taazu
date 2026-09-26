/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: { sans: ['"Plus Jakarta Sans"', "ui-sans-serif", "system-ui", "sans-serif"] },
      boxShadow: {
        card: "0 1px 2px rgba(28,25,23,.04), 0 10px 28px -14px rgba(28,25,23,.14)",
        lift: "0 2px 4px rgba(28,25,23,.05), 0 18px 36px -16px rgba(28,25,23,.22)",
      },
    },
  },
  plugins: [],
}

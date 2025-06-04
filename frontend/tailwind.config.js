/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}", // Scan these files for Tailwind classes
  ],
  theme: {
    extend: {},  // You can add custom colors, spacing, fonts here
  },
  plugins: [],
};

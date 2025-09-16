/** @type {import('tailwindcss').Config} */
module.exports = {
  mode: 'jit',
  important: true,
  content: [
    "./src/**/*.{html,ts,scss}", // Include all HTML, TypeScript, and SCSS files in the src folder
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}


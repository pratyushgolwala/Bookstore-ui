/** @type {import("tailwindcss").Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // Fraunces — a "soft-but-old-style" display serif for headings & the
        // wordmark. Inter stays as the workhorse text face.
        display: ['Fraunces', 'Georgia', 'Cambria', 'serif'],
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      colors: {
        ink: '#160e07',
        cloth: '#7a3b2e',   // book-cloth red-brown
        brass: '#b98a3e',   // flat brass, no shine
        cream: '#E4D6A9',
      },
    },
  },
  plugins: [],
};

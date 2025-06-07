// frontend/tailwind.config.js
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}', // all your pages + components
    './public/**/*.html', // if you have any static HTML
  ],
  darkMode: 'class',
  important: true,
  corePlugins: {
    preflight: false,
  },
  theme: {
    extend: {},
  },
  plugins: [],
}

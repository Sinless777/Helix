/** @type {import('prettier').Config} */
module.exports = {
  semi: false,
  singleQuote: true,
  printWidth: 100,
  tabWidth: 2,
  trailingComma: 'es5',
  bracketSpacing: true,
  arrowParens: 'avoid',
  endOfLine: 'lf',
  plugins: [
    require('prettier-plugin-tailwindcss'), // automatically sort Tailwind classnames
  ],
  tailwindConfig: './tailwind.config.ts', // customize if your path differs
}

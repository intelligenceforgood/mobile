// Mirrors ui/ Prettier config (ui/ uses Prettier defaults — no explicit .prettierrc).
// Pinned to prettier@3.2.5 to match ui/package.json.
/** @type {import("prettier").Config} */
module.exports = {
  printWidth: 100,
  tabWidth: 2,
  useTabs: false,
  semi: true,
  singleQuote: true,
  trailingComma: 'all',
  bracketSpacing: true,
  arrowParens: 'always',
};

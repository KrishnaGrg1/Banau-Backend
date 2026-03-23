// prettier.config.js
/** @type {import('prettier').Config} */
export default {
  // ── Core formatting ──────────────────────────────────────────────────────
  printWidth: 100,
  tabWidth: 2,
  useTabs: false,
  semi: false,
  singleQuote: true,
  quoteProps: 'as-needed',
  trailingComma: 'all',
  bracketSpacing: true,
  bracketSameLine: false,
  arrowParens: 'always',

  // ── JSX ───────────────────────────────────────────────────────────────────
  jsxSingleQuote: false, // keep JSX attrs in double quotes (HTML convention)

  // ── End of line ───────────────────────────────────────────────────────────
  endOfLine: 'lf',

  // ── File-specific overrides ───────────────────────────────────────────────
  overrides: [
    {
      // JSON files (tsconfig, package.json, etc.)
      files: ['*.json', '*.jsonc'],
      options: {
        printWidth: 120,
        trailingComma: 'none', // JSON doesn't support trailing commas
      },
    },
    {
      // CSS / Tailwind
      files: ['*.css'],
      options: {
        singleQuote: false,
      },
    },
    {
      // Markdown — don't wrap prose lines
      files: ['*.md', '*.mdx'],
      options: {
        printWidth: 9999,
        proseWrap: 'never',
      },
    },
    {
      // Prisma schema
      files: ['*.prisma'],
      options: {
        tabWidth: 2,
      },
    },
  ],
}

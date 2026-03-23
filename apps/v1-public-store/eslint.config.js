// @ts-check
import { tanstackConfig } from '@tanstack/eslint-config'

export default [
  {
    ignores: [
      'src/routeTree.gen.ts',
      'eslint.config.js',
      'prettier.config.js',
      'vite.config.ts',
      'src/components/ui/*',
    ],
  },
  ...tanstackConfig,
  {
    rules: {
      // ── Imports — too noisy for existing codebase, fix gradually ──────
      'import/order': 'off',
      'import/newline-after-import': 'off',
      'import/first': 'off',
      'import/no-duplicates': 'warn',
      'import/consistent-type-specifier-style': 'off',
      'sort-imports': 'off',

      // ── TypeScript — practical relaxations ────────────────────────────
      '@typescript-eslint/no-unnecessary-condition': 'warn', // ← warn not off
      '@typescript-eslint/no-unnecessary-type-assertion': 'warn',
      '@typescript-eslint/array-type': 'off',
      '@typescript-eslint/require-await': 'warn',
      '@typescript-eslint/consistent-type-imports': 'off',
      '@typescript-eslint/no-shadow': 'warn',
      'no-shadow': 'off',

      // ── TanStack Start: throw redirect() / notFound() are valid ───────
      '@typescript-eslint/only-throw-error': [
        'error',
        {
          allow: [
            { from: 'package', package: '@tanstack/router-core', name: 'Redirect' },
            { from: 'package', package: '@tanstack/react-start', name: 'NotFoundError' },
          ],
        },
      ],

      // ── Allow async event handlers in JSX ─────────────────────────────
      '@typescript-eslint/no-misused-promises': [
        'error',
        { checksVoidReturn: { attributes: false } },
      ],

      // ── Misc ──────────────────────────────────────────────────────────
      'node/prefer-node-protocol': 'off',
      '@stylistic/spaced-comment': 'off',
    },
  },
]

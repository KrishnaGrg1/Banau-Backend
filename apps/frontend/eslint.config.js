//  @ts-check

import { tanstackConfig } from '@tanstack/eslint-config'

export default [
  { ignores: ['src/routeTree.gen.ts', 'eslint.config.js', 'prettier.config.js'] },
  ...tanstackConfig,
  {
    rules: {
      // Import ordering — too noisy for existing codebase
      'import/order': 'off',
      'import/newline-after-import': 'off',
      'import/first': 'off',
      'import/no-duplicates': 'warn',
      'import/consistent-type-specifier-style': 'off',
      'sort-imports': 'off',
      // Unnecessary condition / optional chain — false positives with loose types
      '@typescript-eslint/no-unnecessary-condition': 'off',
      '@typescript-eslint/no-unnecessary-type-assertion': 'warn',
      // Misc
      'no-shadow': 'off',
      '@typescript-eslint/no-shadow': 'warn',
      '@typescript-eslint/array-type': 'off',
      '@typescript-eslint/require-await': 'warn',
      '@typescript-eslint/consistent-type-imports': 'off',
      'node/prefer-node-protocol': 'off',
      '@stylistic/spaced-comment': 'off',
    },
  },
]

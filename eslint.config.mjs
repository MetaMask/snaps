import base, { createConfig } from '@metamask/eslint-config';
import jest from '@metamask/eslint-config-jest';
import nodejs from '@metamask/eslint-config-nodejs';
import typescript from '@metamask/eslint-config-typescript';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';

const config = createConfig([
  {
    ignores: ['dist/', 'docs/', '.yarn/'],
  },

  // Base configuration
  {
    extends: base,

    languageOptions: {
      sourceType: 'module',
      parserOptions: {
        tsconfigRootDir: import.meta.dirname,
        project: ['./tsconfig.packages.json'],
      },
    },

    settings: {
      'import-x/extensions': ['.js', '.mjs'],
    },
  },

  // TypeScript source files
  {
    files: ['**/*.ts', '**/*.mts', '**/*.tsx'],
    extends: typescript,

    rules: {
      // This prevents using the `console.log` and similar functions. All logging
      // should be done through the module logger, or `logError` function in
      // `@metamask/snaps-utils`.
      'no-console': 'error',

      // This allows importing the `Text` JSX component.
      '@typescript-eslint/no-shadow': [
        'error',
        {
          allow: ['Text'],
        },
      ],

      // Without the `allowAny` option, this rule causes a lot of false
      // positives.
      '@typescript-eslint/restrict-template-expressions': [
        'error',
        {
          allowAny: true,
          allowBoolean: true,
          allowNumber: true,
        },
      ],
    },
  },

  // Node.js / TypeScript scripts
  {
    files: [
      'scripts/**/*.ts',
      'scripts/**/*.mts',
      '**/*.js',
      '**/*.cjs',
      '**/*.mjs',
      'packages/snaps-execution-environments/scripts/**/*.ts',
      'packages/snaps-execution-environments/scripts/**/*.js',
    ],

    extends: nodejs,

    languageOptions: {
      sourceType: 'module',
      parserOptions: {
        tsconfigRootDir: import.meta.dirname,
        project: ['./tsconfig.json'],
      },
    },

    rules: {
      'n/hashbang': 'off',
    },
  },

  // Test files
  {
    files: ['**/*.test.ts', '**/*.test.js'],
    extends: [jest, nodejs],

    'jest/expect-expect': [
      'error',
      {
        assertFunctionNames: ['expect', 'expectTypeOf'],
      },
    ],
  },

  // Packages that are Node.js-only
  {
    files: ['packages/create-snap/**/*.ts', 'packages/snaps-cli/**/*.ts'],
    extends: [nodejs],

    rules: {
      'n/hashbang': 'off',
    },
  },

  // Configuration specific to `@metamask/snaps-simulator`
  {
    files: [
      'packages/snaps-simulator/**/*.ts',
      'packages/snaps-simulator/**/*.tsx',
    ],

    extends: [
      react.configs.flat.recommended,
      react.configs.flat.recommended['jsx-runtime'],
      reactHooks.configs.recommended,
    ],
  },
]);

export default config;

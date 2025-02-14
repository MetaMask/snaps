import base, { createConfig } from '@metamask/eslint-config';
import browser from '@metamask/eslint-config-browser';
import jest from '@metamask/eslint-config-jest';
import nodejs from '@metamask/eslint-config-nodejs';
import typescript from '@metamask/eslint-config-typescript';

const config = createConfig([
  {
    ignores: ['**/coverage', '**/dist/', '**/docs/', '**/public/', '.yarn/'],
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

      // This is too strict for some cases, like when a Promise is used to
      // perform a side effect.
      // TODO: Upstream this change to `@metamask/eslint-config`.
      'promise/always-return': 'off',

      // TODO: Consider enabling this rule.
      '@typescript-eslint/explicit-function-return-type': 'off',

      // This allows importing the `Text` JSX component.
      '@typescript-eslint/no-shadow': [
        'error',
        {
          allow: ['Text'],
        },
      ],

      // When enabled, this rule disallows comparing strings to enums. This is
      // too strict for some cases.
      // TODO: Upstream this change to `@metamask/eslint-config-typescript`.
      '@typescript-eslint/no-unsafe-enum-comparison': 'off',

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

      // Copied from `@metamask/eslint-config-typescript`, but modified to allow
      // more flexibility in imports.
      // TODO: Upstream this change to `@metamask/eslint-config-typescript`.
      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: 'default',
          format: ['camelCase'],
          leadingUnderscore: 'allow',
          trailingUnderscore: 'forbid',
        },
        {
          selector: 'enumMember',
          format: ['PascalCase'],
        },
        {
          selector: 'import',
          format: ['camelCase', 'PascalCase', 'snake_case', 'UPPER_CASE'],
        },
        {
          selector: 'interface',
          format: ['PascalCase'],
          custom: {
            regex: '^I[A-Z]',
            match: false,
          },
        },
        {
          selector: 'objectLiteralMethod',
          format: ['camelCase', 'PascalCase', 'UPPER_CASE'],
        },
        {
          selector: 'objectLiteralProperty',
          format: ['camelCase', 'PascalCase', 'UPPER_CASE'],
        },
        {
          selector: 'typeLike',
          format: ['PascalCase'],
        },
        {
          selector: 'typeParameter',
          format: ['PascalCase'],
          custom: {
            regex: '^.{3,}',
            match: true,
          },
        },
        {
          selector: 'variable',
          format: ['camelCase', 'UPPER_CASE', 'PascalCase'],
          leadingUnderscore: 'allow',
        },
        {
          selector: 'parameter',
          format: ['camelCase', 'PascalCase'],
          leadingUnderscore: 'allow',
        },
        {
          selector: [
            'classProperty',
            'objectLiteralProperty',
            'typeProperty',
            'classMethod',
            'objectLiteralMethod',
            'typeMethod',
            'accessor',
            'enumMember',
          ],
          format: null,
          modifiers: ['requiresQuotes'],
        },
      ],
    },
  },

  // Node.js + TypeScript scripts
  {
    files: [
      '**/scripts/**/*.ts',
      '**/scripts/**/*.mts',
      'packages/snaps-execution-environments/scripts/**/*.ts',
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

  // CommonJS Node.js scripts
  {
    files: ['**/*.js', '**/*.cjs'],
    extends: nodejs,

    languageOptions: {
      sourceType: 'script',
    },

    rules: {
      'n/hashbang': 'off',
    },
  },

  // ESM Node.js scripts
  {
    files: ['**/*.mjs'],
    extends: nodejs,

    languageOptions: {
      sourceType: 'module',
    },

    rules: {
      'n/hashbang': 'off',
    },
  },

  // Test files
  {
    files: ['**/*.test.ts', '**/*.test.js'],
    extends: [jest, nodejs],

    rules: {
      // This rule is too strict for test files.
      // TODO: Upstream this change to `@metamask/eslint-config-jest`.
      '@typescript-eslint/unbound-method': 'off',

      'jest/expect-expect': [
        'error',
        {
          assertFunctionNames: ['expect', 'expectSaga', 'expectTypeOf'],
        },
      ],

      // This rule is too strict for test files.
      // TODO: Upstream this change to `@metamask/eslint-config-jest`.
      'jest/no-conditional-in-test': 'off',

      // This rule is too strict for test files.
      'no-console': 'off',
    },
  },

  // Files that contain Node.js functionality
  {
    files: [
      'packages/create-snap/src/**/*',
      'packages/snaps-browserify-plugin/src/**/*',
      'packages/snaps-cli/src/**/*',
      'packages/snaps-rollup-plugin/src/**/*',
      'packages/snaps-simulation/src/**/*',
      'packages/snaps-utils/src/**/*',
      'packages/snaps-webpack-plugin/src/**/*',
      'packages/test-snaps/src/**/*',
      '**/test-utils/**/*.ts',
      '**/webpack.config.ts',
      '**/snap.config.ts',
    ],
    extends: nodejs,

    rules: {
      'n/hashbang': 'off',
      'no-restricted-globals': 'off',
    },
  },

  // Files that contain browser functionality
  {
    files: [
      'packages/snaps-execution-environments/src/**/*',
      'packages/snaps-simulator/src/**/*',
      'packages/test-snaps/src/**/*',
      '**/*.test.browser.ts',
    ],
    extends: [browser],
  },
]);

export default config;

import base, { createConfig } from '@metamask/eslint-config';
import browser from '@metamask/eslint-config-browser';
import jest from '@metamask/eslint-config-jest';
import nodejs from '@metamask/eslint-config-nodejs';
import typescript from '@metamask/eslint-config-typescript';

const config = createConfig([
  {
    ignores: [
      '**/assembly',
      '**/coverage',
      '**/dist',
      '**/docs',
      '**/public',
      '.yarn',
    ],
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

    rules: {
      // This allows `Promise.catch().finally()` to be used without a return
      // statement.
      // TODO: Upstream this change to `@metamask/eslint-config`.
      'promise/catch-or-return': [
        'error',
        {
          allowFinally: true,
        },
      ],

      // By default the `resolve` and `reject` parameters of a Promise are
      // expected to be named `resolve` and `reject`. This rule allows the
      // parameters to be named `resolveSomething` and `rejectSomething`.
      // TODO: Upstream this change to `@metamask/eslint-config`.
      'promise/param-names': [
        'error',
        {
          resolvePattern: '^_?resolve',
          rejectPattern: '^_?reject',
        },
      ],
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

      // This allows `@property` despite being "redundant" in a type system.
      // We use it to document the properties of an object that are not declared
      // directly in the type.
      // TODO: Upstream this change to `@metamask/eslint-config`.
      'jsdoc/check-tag-names': [
        'error',
        {
          definedTags: ['property'],
        },
      ],

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

      // Allow `Promise.reject` to be called with any value.
      // TODO: Upstream this change to `@metamask/eslint-config-typescript`.
      '@typescript-eslint/prefer-promise-reject-errors': 'off',

      // Copied from `@metamask/eslint-config-typescript`, but modified to
      // consider `default` as exhaustive in switch statements.
      // TODO: Upstream this change to `@metamask/eslint-config-typescript`.
      '@typescript-eslint/switch-exhaustiveness-check': [
        'error',
        {
          considerDefaultExhaustiveForUnions: true,
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
    files: [
      '**/*.test.ts',
      '**/*.test.tsx',
      '**/*.test.browser.ts',
      '**/*.test.js',
    ],
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
      'n/no-unsupported-features/node-builtins': 'off',

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
      'packages/snaps-controllers/src/services/node-js/**/*',
      'packages/snaps-jest/src/**/*',
      'packages/snaps-rollup-plugin/src/**/*',
      'packages/snaps-simulation/src/**/*',
      'packages/snaps-utils/src/**/*',
      'packages/snaps-webpack-plugin/src/**/*',
      'packages/test-snaps/src/**/*',
      '**/scripts/**/*.ts',
      '**/test-utils/**/*.ts',
      '**/webpack.config.ts',
      '**/snap.config.ts',
    ],
    extends: nodejs,

    rules: {
      // These rules are too strict for some cases.
      // TODO: Re-investigate these rules.
      'n/callback-return': 'off',
      'n/hashbang': 'off',
      'n/no-unsupported-features/node-builtins': 'off',
      'n/no-process-env': 'off',
      'n/no-process-exit': 'off',
      'n/no-sync': 'off',
      'no-restricted-globals': 'off',
    },
  },

  // Files that contain browser functionality
  {
    files: [
      'packages/snaps-controllers/src/services/iframe/**/*',
      'packages/snaps-controllers/src/services/webworker/**/*',
      'packages/snaps-execution-environments/src/**/*',
      'packages/snaps-simulator/src/**/*',
      'packages/snaps-simulator/jest.setup.js',
      'packages/test-snaps/src/**/*',
      '**/*.test.browser.ts',
    ],
    extends: [browser],
  },

  // Entrypoint files for legacy build tools
  {
    files: [
      'packages/snaps-controllers/react-native.d.ts',
      'packages/snaps-controllers/react-native.js',
      'packages/snaps-sdk/jsx-dev-runtime.d.ts',
      'packages/snaps-sdk/jsx-dev-runtime.js',
      'packages/snaps-sdk/jsx-runtime.d.ts',
      'packages/snaps-sdk/jsx-runtime.js',
      'packages/snaps-sdk/jsx.d.ts',
      'packages/snaps-sdk/jsx.js',
    ],

    rules: {
      'import-x/extensions': 'off',
      'import-x/no-unresolved': 'off',
    },
  },
]);

export default config;

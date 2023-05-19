module.exports = {
  root: true,

  extends: ['../../.eslintrc.js'],

  parserOptions: {
    tsconfigRootDir: __dirname,
  },

  settings: {
    'import/extensions': ['.ts', '.tsx'],
  },

  rules: {
    // TODO: Investigate why this is needed.
    'node/no-unpublished-import': 'off',
    'node/no-unpublished-require': 'off',
  },

  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      extends: [
        'plugin:react/recommended',
        'plugin:react/jsx-runtime',
        'plugin:react-hooks/recommended',
      ],
      rules: {
        '@typescript-eslint/no-shadow': [
          'error',
          {
            allow: ['Text'],
          },
        ],

        'react/display-name': 'off',
        'react/prop-types': 'off',

        // TODO: Investigate why this is needed.
        'node/no-unpublished-import': 'off',
        'node/no-unpublished-require': 'off',
      },
      settings: {
        react: {
          version: 'detect',
        },
      },
    },

    {
      files: ['*.test.ts', '*.test.js'],
      extends: [
        '@metamask/eslint-config-jest',
        '@metamask/eslint-config-nodejs',
      ],
      rules: {
        'no-restricted-globals': 'off',
        'jest/expect-expect': [
          'error',
          {
            assertFunctionNames: ['expect', 'expectSaga'],
          },
        ],

        // TODO: Investigate why this is needed.
        'node/no-unpublished-import': 'off',
        'node/no-unpublished-require': 'off',
      },
    },

    {
      files: ['webpack.config.ts'],
      extends: ['@metamask/eslint-config-nodejs'],
      rules: {
        // TODO: Investigate why this is needed.
        'node/no-unpublished-import': 'off',
        'node/no-unpublished-require': 'off',
      },
    },
  ],

  ignorePatterns: ['!.eslintrc.js', '!.prettierrc.js', 'dist/', '.yarn/'],
};

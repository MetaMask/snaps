module.exports = {
  root: true,

  extends: ['@metamask/eslint-config'],

  parserOptions: {
    tsconfigRootDir: __dirname,
  },

  env: {
    'shared-node-browser': true,
  },

  overrides: [
    {
      files: ['**/*.js'],
      extends: ['@metamask/eslint-config-nodejs'],
    },

    {
      files: ['**/*.ts'],
      extends: ['@metamask/eslint-config-typescript'],
      rules: {
        // This rule disallows the `private` modifier on class fields, but we
        // use it in some places.
        'no-restricted-syntax': 'off',

        // This rule does not support TypeScript.
        'no-undef': 'off',

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

    {
      files: ['**/*.test.ts', '**/*.test.js'],
      extends: ['@metamask/eslint-config-jest'],
      rules: {
        '@typescript-eslint/no-shadow': [
          'error',
          { allow: ['describe', 'expect', 'it'] },
        ],
        '@typescript-eslint/unbound-method': 'off',
      },
    },
  ],

  ignorePatterns: ['!.prettierrc.js', '**/!.eslintrc.js', '**/dist*/'],
};

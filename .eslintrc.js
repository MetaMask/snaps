module.exports = {
  root: true,

  extends: ['@metamask/eslint-config'],

  parserOptions: {
    tsconfigRootDir: __dirname,
  },

  env: {
    'shared-node-browser': true,
  },

  rules: {
    // This prevents importing Node.js builtins. We currently use them in
    // our codebase, so this rule is disabled. This rule should be disabled
    // in `@metamask/eslint-config-nodejs` in the future.
    'import/no-nodejs-modules': 'off',

    // This prevents using the `console.log` and similar functions. All logging
    // should be done through the module logger, or `logError` function in
    // `@metamask/snaps-utils`.
    'no-console': 'error',

    // This prevents using Node.js and/or browser specific globals. We
    // currently use both in our codebase, so this rule is disabled.
    'no-restricted-globals': 'off',

    // This rule disallows the `private` modifier on class fields, but we
    // use it in some places. It also disables function expressions, but this
    // triggers for class methods as well.
    'no-restricted-syntax': 'off',
  },

  overrides: [
    {
      files: ['**/*.js'],
      extends: ['@metamask/eslint-config-nodejs'],

      rules: {
        // This prevents using Node.js and/or browser specific globals. We
        // currently use both in our codebase, so this rule is disabled.
        'no-restricted-globals': 'off',
      },
    },

    {
      files: ['**/*.ts'],
      extends: ['@metamask/eslint-config-typescript'],
      rules: {
        // This rule disallows the `private` modifier on class fields, but we
        // use it in some places. It also disables function expressions, but this
        // triggers for class methods as well.
        'no-restricted-syntax': 'off',

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
        'no-console': 'off',
      },
    },
  ],

  ignorePatterns: ['!.prettierrc.js', '**/!.eslintrc.js', '**/dist*/'],
};

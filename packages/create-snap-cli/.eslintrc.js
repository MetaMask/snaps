module.exports = {
  extends: ['../../.eslintrc.js'],

  parserOptions: {
    tsconfigRootDir: __dirname,
  },

  overrides: [
    {
      files: ['**/*.ts'],
      extends: ['@metamask/eslint-config-nodejs'],
      globals: {
        snaps: true,
      },
    },

    {
      files: ['src/**/*', 'scripts/**/*'],
      rules: {
        'node/no-process-exit': 'off',
      },
    },

    {
      files: ['src/main.ts'],
      rules: {
        'node/shebang': 'off',
      },
    },

    {
      files: ['**/*.test.ts'],
      rules: {
        'node/no-callback-literal': 'off',
      },
    },
  ],
};

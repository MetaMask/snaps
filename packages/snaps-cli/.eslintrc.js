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
      files: ['src/main.ts'],
      rules: {
        'n/shebang': 'off',
      },
    },

    {
      files: ['**/*.e2e.test.ts'],
      rules: {
        'jest/expect-expect': 'off',
      },
    },
  ],
};

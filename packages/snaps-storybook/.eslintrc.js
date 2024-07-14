module.exports = {
  extends: ['../../.eslintrc.js'],

  parserOptions: {
    tsconfigRootDir: __dirname,
  },

  overrides: [
    {
      files: ['**/theme/**/*.ts', '**/components/snaps/**/*.styles.ts'],
      rules: {
        '@typescript-eslint/naming-convention': 'off',
        '@typescript-eslint/unbound-method': 'off',
      },
    },
  ],
};

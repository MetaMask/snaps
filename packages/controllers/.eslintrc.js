module.exports = {
  extends: ['../../.eslintrc.js'],

  rules: {
    '@typescript-eslint/consistent-type-definitions': 'off',
  },

  // TODO:temp
  ignorePatterns: ['**/temp/**'],

  overrides: [
    {
      files: ['**/*.d.ts'],
      rules: {
        'import/unambiguous': 'off',
      },
    },
  ],
};

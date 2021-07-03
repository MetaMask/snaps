module.exports = {
  extends: ['../../.eslintrc.js'],

  rules: {
    '@typescript-eslint/consistent-type-definitions': 'off',
  },

  overrides: [
    {
      files: ['**/*.d.ts'],
      rules: {
        'import/unambiguous': 'off',
      },
    },
  ],
};

module.exports = {
  extends: ['../../.eslintrc.js'],

  rules: {
    '@typescript-eslint/consistent-type-definitions': 'off',
    'no-shadow': 'off',
    '@typescript-eslint/no-shadow': ['error', { builtinGlobals: true }],
  },
};

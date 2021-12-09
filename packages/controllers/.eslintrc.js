module.exports = {
  extends: ['../../.eslintrc.js'],

  rules: {
    '@typescript-eslint/consistent-type-definitions': 'off',
  },

  ignorePatterns: ['src/snaps/json-schemas'],
};

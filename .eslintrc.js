module.exports = {
  root: true,

  extends: ['@metamask/eslint-config'],

  overrides: [
    {
      files: ['**/*.js'],
      extends: ['@metamask/eslint-config-nodejs'],
    },

    {
      files: ['**/*.ts'],
      extends: ['@metamask/eslint-config-typescript'],
    },
  ],

  ignorePatterns: ['**/!.eslintrc.js', '**/dist*/'],
};

module.exports = {
  extends: ['../../.eslintrc.js'],

  overrides: [
    {
      files: ['examples/**/*.js', 'examples/**/*.ts'],
      // TODO: Replace this with the actual snap globals
      env: {
        browser: true,
      },
      globals: {
        wallet: true,
      },
      rules: {
        'no-alert': 'off',
        'import/no-unresolved': 'off',
        'node/no-unpublished-require': 'off',
      },
    },
  ],

  ignorePatterns: ['!.eslintrc.js', '!.prettierrc.js', 'dist/'],
};

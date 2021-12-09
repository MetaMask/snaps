module.exports = {
  extends: ['../../.eslintrc.js'],

  overrides: [
    {
      files: ['src/**/*.js'],
      // TODO: Replace this with the actual snap globals
      env: {
        browser: true,
      },
      globals: {
        wallet: true,
      },
    },
  ],

  ignorePatterns: ['!.eslintrc.js', '!.prettierrc.js', 'dist/'],
};

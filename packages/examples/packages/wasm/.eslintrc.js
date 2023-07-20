const { resolve } = require('path');

module.exports = {
  extends: ['../../.eslintrc.js'],

  parserOptions: {
    tsconfigRootDir: __dirname,
  },

  overrides: [
    {
      files: ['assembly/**/*.ts'],

      parserOptions: {
        tsconfigRootDir: resolve(__dirname, 'assembly'),
      },
    },
  ],

  ignorePatterns: [
    '!.prettierrc.js',
    '**/!.eslintrc.js',
    '**/dist*/',
    'packages/**',
    'program/**',
    'build/**',
  ],
};

module.exports = {
  extends: ['../../.eslintrc.js'],

  parserOptions: {
    tsconfigRootDir: __dirname,
  },

  overrides: [
    {
      files: ['*.test.ts'],
      rules: {
        'jsdoc/check-tag-names': [
          'error',
          {
            definedTags: ['jest-environment'],
          },
        ],
      },
    },
    {
      files: ['scripts/**/*.js'],
      extends: ['@metamask/eslint-config-nodejs'],
      parserOptions: {
        ecmaVersion: 2021,
      },
    },
  ],

  ignorePatterns: ['src/openrpc.json', 'webpack.config.js', '__test__'],
};

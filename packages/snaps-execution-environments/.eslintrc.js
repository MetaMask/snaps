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
  ],

  ignorePatterns: ['src/openrpc.json', 'webpack.config.js', '__test__'],
};

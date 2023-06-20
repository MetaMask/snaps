module.exports = {
  extends: ['../../.eslintrc.js'],

  parserOptions: {
    tsconfigRootDir: __dirname,
  },

  overrides: [
    {
      files: ['rollup.config.js'],
      parserOptions: {
        sourceType: 'module',
      },
      rules: {
        'import/no-unresolved': 'off',
      },
    },
  ],
};

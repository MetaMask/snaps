module.exports = {
  extends: ['../../.eslintrc.js'],

  overrides: [
    {
      files: ['*.d.ts'],
      rules: {
        'import/unambiguous': 'off',
      },
    },
  ],
};

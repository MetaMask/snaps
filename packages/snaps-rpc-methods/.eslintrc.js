module.exports = {
  extends: ['../../.eslintrc.js'],

  overrides: [
    {
      files: ['**/*test.ts'],
      rules: {
        'jest/expect-expect': [
          'error',
          {
            assertFunctionNames: ['expect', 'expectTypeOf'],
          },
        ],
      },
    },
  ],

  parserOptions: {
    tsconfigRootDir: __dirname,
  },
};

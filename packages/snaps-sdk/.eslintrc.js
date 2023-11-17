module.exports = {
  extends: ['../../.eslintrc.js'],

  parserOptions: {
    tsconfigRootDir: __dirname,
  },

  overrides: [
    {
      files: ['*.test.ts'],
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
};

module.exports = {
  extends: ['../../.eslintrc.js'],

  parserOptions: {
    tsconfigRootDir: __dirname,
  },

  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      rules: {
        '@typescript-eslint/no-shadow': [
          'error',
          {
            allow: ['Text'],
          },
        ],
      },
    },
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

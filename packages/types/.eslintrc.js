module.exports = {
  extends: [
    '@metamask/eslint-config',
    '@metamask/eslint-config/config/typescript',
  ],
  plugins: [
    'json',
  ],
  overrides: [
    {
      files: [
        '*.js',
        '*.json',
      ],
      parserOptions: {
        sourceType: 'script',
      },
      rules: {
        '@typescript-eslint/no-require-imports': 'off',
        '@typescript-eslint/no-var-requires': 'off',
      },
    },
  ],
  ignorePatterns: [
    '!.eslintrc.js',
    'dist/',
    'node_modules/',
  ],
};

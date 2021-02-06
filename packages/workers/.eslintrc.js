module.exports = {
  extends: [
    '@metamask/eslint-config',
    '@metamask/eslint-config/config/nodejs',
    '@metamask/eslint-config/config/typescript',
  ],
  plugins: ['json'],
  parserOptions: {
    ecmaVersion: 2018,
  },
  rules: {
    semi: ['error', 'always'],
    'space-before-function-paren': [
      'error',
      {
        anonymous: 'always',
        asyncArrow: 'always',
        named: 'never',
      },
    ],
  },
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
    {
      files: ['src/PluginWorker.ts'],
      env: {
        browser: true,
      },
      globals: {
        BigInt: true,
      },
      rules: {
        'node/no-unpublished-import': 'off',
      },
    },
  ],
  ignorePatterns: [
    '!.eslintrc.js',
    'dist*/',
    'node_modules/',
  ],
};

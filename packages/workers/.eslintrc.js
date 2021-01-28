module.exports = {
  extends: ['@metamask/eslint-config', '@metamask/eslint-config/config/nodejs'],
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
      files: ['src/pluginWorker.js'],
      env: {
        browser: true,
      },
      globals: {
        BigInt: true,
      },
      rules: {
        'node/no-unpublished-require': 'off',
      },
    },
  ],
  ignorePatterns: [
    '!.eslintrc.js',
    'dist/',
    'node_modules/',
    'lockdown.cjs', // TODO: Use the actual import
  ],
};

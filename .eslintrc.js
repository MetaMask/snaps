module.exports = {
  extends: [
    '@metamask/eslint-config',
    '@metamask/eslint-config/config/nodejs',
  ],
  plugins: [
    'json',
  ],
  parserOptions: {
    ecmaVersion: 2018,
  },
  rules: {
    // TODO: Remove these once they've landed on the main config
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
        'src/**/*.js',
      ],
      env: {
        node: true,
      },
      globals: {
        snaps: true,
      },
      rules: {
        'node/no-process-exit': 'off',
      },
    },
    {
      files: [
        'scripts/**/*.js',
      ],
      env: {
        node: true,
      },
    },
    {
      files: [
        'examples/**/*.js',
      ],
      env: {
        browser: true,
      },
      globals: {
        wallet: true,
      },
      rules: {
        'no-alert': 'off',
      },
    },
  ],
  ignorePatterns: [
    '!.eslintrc.js',
    'dist/',
    'node_modules/',
  ],
};

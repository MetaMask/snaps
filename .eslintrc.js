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
  overrides: [
    {
      files: [
        'src/**/*.ts',
        'development/*.ts',
      ],
      extends: [
        '@metamask/eslint-config/config/typescript',
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
    },
  ],
  ignorePatterns: [
    '!.eslintrc.js',
    'dist/',
    'node_modules/',
  ],
}

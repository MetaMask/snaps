module.exports = {
  extends: ['../../.eslintrc.js'],

  overrides: [
    {
      files: ['src/SnapWorker.ts'],
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
};

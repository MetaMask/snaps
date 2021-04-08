module.exports = {
  extends: ['../../.eslintrc.js'],

  overrides: [
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
};

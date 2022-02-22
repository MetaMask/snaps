module.exports = {
  extends: ['../../.eslintrc.js'],
  ignorePatterns: ['**/*__GENERATED__*'],
  overrides: [
    {
      files: ['**/*.ts'],
      extends: ['@metamask/eslint-config-nodejs'],
      globals: {
        snaps: true,
      },
    },

    {
      files: ['src/**/*', 'scripts/**/*'],
      rules: {
        'node/no-process-exit': 'off',
      },
    },

    {
      files: ['src/main.ts'],
      rules: {
        'node/shebang': 'off',
      },
    },

    {
      files: [
        // Exports a yargs middleware function, which must be synchronous.
        'src/utils/snap-config.ts',
        'src/utils/snap-config.test.ts',
      ],
      rules: {
        'node/no-sync': 'off',
      },
    },

    {
      files: ['**/*.test.ts'],
      rules: {
        'node/no-callback-literal': 'off',
      },
    },
  ],
};

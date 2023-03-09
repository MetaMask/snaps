const deepmerge = require('deepmerge');

const baseConfig = require('../../jest.config.base');

delete baseConfig.coverageThreshold;

module.exports = deepmerge(baseConfig, {
  coveragePathIgnorePatterns: [
    './src/index.ts',
    './src/iframe/index.ts',
    './src/node-process/index.ts',
    './src/node-thread/index.ts',
    './src/offscreen/index.ts',
    './src/common/test-utils',
  ],
  coverageDirectory: './coverage/jest',
  testTimeout: 10000,
  testEnvironment: '<rootDir>/jest.environment.js',
  testEnvironmentOptions: {
    customExportConditions: ['node', 'node-addons'],
  },

  // This is required for `jest-fetch-mock` to work.
  resetMocks: false,
});

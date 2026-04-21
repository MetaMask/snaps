const deepmerge = require('deepmerge');

const baseConfig = require('../../jest.config.base');

delete baseConfig.coverageThreshold;
delete baseConfig.coverageReporters;

module.exports = deepmerge(baseConfig, {
  coverageDirectory: './coverage/jest',
  coverageReporters: ['html', 'json-summary', 'json'],
  coveragePathIgnorePatterns: [
    './src/index.ts',
    './src/iframe/index.ts',
    './src/offscreen/index.ts',
    './src/webworker/executor/index.ts',
    './src/webworker/pool/index.ts',
    './src/common/test-utils',
  ],

  testTimeout: 10000,
  testEnvironment: '<rootDir>/jest.environment.js',
  testEnvironmentOptions: {
    customExportConditions: ['node', 'node-addons'],
  },

  // This is required for `jest-fetch-mock` to work.
  resetMocks: false,
});

const deepmerge = require('deepmerge');

const baseConfig = require('../../jest.config.base');

module.exports = deepmerge(baseConfig, {
  coveragePathIgnorePatterns: ['./src/index.ts', './src/common/test-utils'],
  coverageThreshold: {
    global: {
      branches: 60.11,
      functions: 70.07,
      lines: 69.54,
      statements: 69.63,
    },
  },
  testTimeout: 10000,
  testEnvironment: '<rootDir>/jest.environment.js',
  testEnvironmentOptions: {
    customExportConditions: ['node', 'node-addons'],
  },

  // This is required for `jest-fetch-mock` to work.
  resetMocks: false,
});

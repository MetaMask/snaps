const deepmerge = require('deepmerge');

const baseConfig = require('../../jest.config.base');

module.exports = deepmerge(baseConfig, {
  coveragePathIgnorePatterns: ['./src/index.ts', '.ava.test.ts'],
  coverageThreshold: {
    global: {
      branches: 83.68,
      functions: 92.19,
      lines: 87.11,
      statements: 87.22,
    },
  },
  testEnvironment: '<rootDir>/jest.environment.js',
  testEnvironmentOptions: {
    customExportConditions: ['node', 'node-addons'],
  },
  testTimeout: 2500,
  testPathIgnorePatterns: ['.ava.test.ts'],
});

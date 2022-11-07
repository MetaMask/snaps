const deepmerge = require('deepmerge');
const baseConfig = require('../../jest.config.base');

module.exports = deepmerge(baseConfig, {
  coveragePathIgnorePatterns: ['./src/index.ts'],
  coverageThreshold: {
    global: {
      branches: 89.88,
      functions: 90.09,
      lines: 87.81,
      statements: 87.81,
    },
  },
  testEnvironment: '<rootDir>/jest.environment.js',
  testEnvironmentOptions: {
    customExportConditions: ['node', 'node-addons'],
  },
  testTimeout: 2500,
});

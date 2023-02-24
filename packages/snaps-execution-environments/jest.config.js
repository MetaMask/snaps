const deepmerge = require('deepmerge');

const baseConfig = require('../../jest.config.base');

module.exports = deepmerge(baseConfig, {
  coveragePathIgnorePatterns: ['./src/index.ts'],
  coverageThreshold: {
    global: {
      branches: 78.76,
      functions: 87.5,
      lines: 89.64,
      statements: 89.71,
    },
  },
  testTimeout: 10000,
  testEnvironment: '<rootDir>/jest.environment.js',
  testEnvironmentOptions: {
    resources: 'usable',
    runScripts: 'dangerously',
    customExportConditions: ['node', 'node-addons'],
  },
});

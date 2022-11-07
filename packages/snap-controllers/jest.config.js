const deepmerge = require('deepmerge');
const baseConfig = require('../../jest.config.base');

module.exports = deepmerge(baseConfig, {
  coverageThreshold: {
    global: {
      branches: 84.8,
      functions: 95.8,
      lines: 94.94,
      statements: 95.04,
    },
  },
  projects: [
    deepmerge(baseConfig, {
      testMatch: ['<rootDir>/src/services/iframe/*.test.ts'],
      testEnvironment: '<rootDir>/jest.environment.js',
      testEnvironmentOptions: {
        resources: 'usable',
        runScripts: 'dangerously',
        customExportConditions: ['node', 'node-addons'],
      },
    }),
    deepmerge(baseConfig, {
      testPathIgnorePatterns: ['<rootDir>/src/services/iframe/*'],
      testEnvironment: '<rootDir>/jest.environment.js',
      testEnvironmentOptions: {
        customExportConditions: ['node', 'node-addons'],
      },
      testRegex: ['\\.test\\.(ts|js)$'],
    }),
  ],
  testTimeout: 5000,
});

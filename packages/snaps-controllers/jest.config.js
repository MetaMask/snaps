const deepmerge = require('deepmerge');

const baseConfig = require('../../jest.config.base');

module.exports = deepmerge(baseConfig, {
  coverageThreshold: {
    global: {
      branches: 88.74,
      functions: 97.23,
      lines: 97.09,
      statements: 97.09,
    },
  },
  projects: [
    {
      moduleNameMapper: baseConfig.moduleNameMapper,
      preset: 'ts-jest',
      testMatch: ['<rootDir>/src/services/iframe/*.test.ts'],
      testEnvironment: '<rootDir>/jest.environment.js',
      testEnvironmentOptions: {
        resources: 'usable',
        runScripts: 'dangerously',
        customExportConditions: ['node', 'node-addons'],
      },
    },
    {
      moduleNameMapper: baseConfig.moduleNameMapper,
      preset: 'ts-jest',
      testPathIgnorePatterns: ['<rootDir>/src/services/iframe/*'],
      testEnvironment: '<rootDir>/jest.environment.js',
      testEnvironmentOptions: {
        customExportConditions: ['node', 'node-addons'],
      },
      testRegex: ['\\.test\\.(ts|js)$'],
    },
  ],
  testTimeout: 5000,
});

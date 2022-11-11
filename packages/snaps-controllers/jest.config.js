const deepmerge = require('deepmerge');
const baseConfig = require('../../jest.config.base');

module.exports = deepmerge(baseConfig, {
  coverageThreshold: {
    global: {
      branches: 89.03,
      functions: 96.44,
      lines: 97.06,
      statements: 97.06,
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

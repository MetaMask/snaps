const deepmerge = require('deepmerge');

const baseConfig = require('../../jest.config.base');

module.exports = deepmerge(baseConfig, {
  coverageThreshold: {
    global: {
      branches: 87.92,
      functions: 94.44,
      lines: 95.6,
      statements: 95.52,
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

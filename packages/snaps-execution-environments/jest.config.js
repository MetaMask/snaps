const deepmerge = require('deepmerge');

const baseConfig = require('../../jest.config.base');

module.exports = deepmerge(baseConfig, {
  coveragePathIgnorePatterns: ['./src/index.ts', '.ava.test.ts'],
  coverageThreshold: {
    global: {
      branches: 82.02,
      functions: 91.6,
      lines: 90.4,
      statements: 90.47,
    },
  },
  projects: [
    deepmerge(baseConfig, {
      coveragePathIgnorePatterns: ['index.ts', '.ava.test.ts'],
      testMatch: ['<rootDir>/src/offscreen/*.test.ts'],
      testEnvironment: '<rootDir>/jest.environment.js',

      // These options are required to run iframes in JSDOM.
      testEnvironmentOptions: {
        resources: 'usable',
        runScripts: 'dangerously',
        customExportConditions: ['node', 'node-addons'],
      },
    }),
    deepmerge(baseConfig, {
      coveragePathIgnorePatterns: ['index.ts', '.ava.test.ts'],
      testPathIgnorePatterns: ['<rootDir>/src/offscreen/*'],
      testEnvironment: '<rootDir>/jest.environment.js',
      testEnvironmentOptions: {
        customExportConditions: ['node', 'node-addons'],
      },
    }),
  ],
});

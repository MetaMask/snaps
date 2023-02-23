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
  projects: [
    deepmerge(baseConfig, {
      coveragePathIgnorePatterns: [
        'index.ts',
        '<rootDir>/src/common/test-utils',
      ],
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
      coveragePathIgnorePatterns: [
        'index.ts',
        '<rootDir>/src/common/test-utils',
      ],
      testPathIgnorePatterns: ['<rootDir>/src/offscreen/*'],
      testEnvironment: '<rootDir>/jest.environment.js',
      testEnvironmentOptions: {
        customExportConditions: ['node', 'node-addons'],
      },
    }),
  ],
});

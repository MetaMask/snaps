const deepmerge = require('deepmerge');

const baseConfig = require('../../jest.config.base');

delete baseConfig.coverageThreshold;

module.exports = deepmerge(baseConfig, {
  coveragePathIgnorePatterns: ['./src/index.ts', '.ava.test.ts'],
  coverageProvider: 'v8',
  projects: [
    deepmerge(baseConfig, {
      coveragePathIgnorePatterns: [
        'index.ts',
        '.ava.test.ts',
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
        '.ava.test.ts',
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

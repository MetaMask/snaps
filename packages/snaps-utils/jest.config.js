const deepmerge = require('deepmerge');

const baseConfig = require('../../jest.config.base');

const coveragePathIgnorePatterns = [
  './src/index.ts',
  './src/index.browser.ts',
  './src/virtual-file/index.ts',
  './src/virtual-file/index.browser.ts',
  './src/manifest/index.ts',
  './src/manifest/index.browser.ts',
  './src/test-utils',
  './src/json-schemas',
  // Jest currently doesn't collect coverage for child processes.
  // https://github.com/facebook/jest/issues/5274
  './src/eval-worker.ts',
];

module.exports = deepmerge(baseConfig, {
  coverageThreshold: {
    global: {
      branches: 92.89,
      functions: 100,
      lines: 98.93,
      statements: 98.94,
    },
  },
  projects: [
    deepmerge(baseConfig, {
      coveragePathIgnorePatterns,
      testMatch: ['<rootDir>/src/iframe.test.ts'],

      // These options are required to run iframes in JSDOM.
      testEnvironment: '<rootDir>/jest.environment.js',
      testEnvironmentOptions: {
        resources: 'usable',
        runScripts: 'dangerously',
        customExportConditions: ['node', 'node-addons'],
      },
    }),
    deepmerge(baseConfig, {
      coveragePathIgnorePatterns,
      testPathIgnorePatterns: ['<rootDir>/src/iframe.test.ts'],
      testEnvironmentOptions: {
        customExportConditions: ['node', 'node-addons'],
      },
    }),
  ],
  testTimeout: 2500,
});

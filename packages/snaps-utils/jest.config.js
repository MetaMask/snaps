const deepmerge = require('deepmerge');

const baseConfig = require('../../jest.config.base');

delete baseConfig.coverageThreshold;
delete baseConfig.coverageReporters;

module.exports = deepmerge(baseConfig, {
  coverageDirectory: './coverage/jest',
  coverageReporters: ['json', 'json-summary', 'html'],
  coveragePathIgnorePatterns: [
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
  ],

  // This is required for `jest-fetch-mock` to work.
  resetMocks: false,
});

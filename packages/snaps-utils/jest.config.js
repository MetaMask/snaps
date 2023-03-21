const deepmerge = require('deepmerge');

const baseConfig = require('../../jest.config.base');

delete baseConfig.coverageThreshold;

module.exports = deepmerge(baseConfig, {
  coverageDirectory: './coverage/jest',
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
});

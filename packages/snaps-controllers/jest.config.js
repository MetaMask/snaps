const deepmerge = require('deepmerge');

const baseConfig = require('../../jest.config.base');

delete baseConfig.coverageThreshold;

module.exports = deepmerge(baseConfig, {
  coverageDirectory: './coverage/jest',
  testTimeout: 10000,

  // This is required for `jest-fetch-mock` to work.
  automock: false,
  resetMocks: false,
  restoreMocks: false,
});

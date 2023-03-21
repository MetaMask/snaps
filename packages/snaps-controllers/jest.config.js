const deepmerge = require('deepmerge');

const baseConfig = require('../../jest.config.base');

delete baseConfig.coverageThreshold;

module.exports = deepmerge(baseConfig, {
  coverageDirectory: './coverage/jest',
  testTimeout: 5000,

  // This is required for `jest-fetch-mock` to work.
  resetMocks: false,
});

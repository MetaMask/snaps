const deepmerge = require('deepmerge');

const baseConfig = require('../../jest.config.base');

module.exports = deepmerge(baseConfig, {
  coverageThreshold: {
    global: {
      branches: 86.95,
      functions: 93.08,
      lines: 94.93,
      statements: 94.86,
    },
  },
  testTimeout: 5000,

  // This is required for `jest-fetch-mock` to work.
  resetMocks: false,
});

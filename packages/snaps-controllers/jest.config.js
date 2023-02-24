const deepmerge = require('deepmerge');

const baseConfig = require('../../jest.config.base');

module.exports = deepmerge(baseConfig, {
  coverageThreshold: {
    global: {
      branches: 88.94,
      functions: 94.67,
      lines: 96.26,
      statements: 96.18,
    },
  },
  testTimeout: 5000,

  // This is required for `jest-fetch-mock` to work.
  resetMocks: false,
});

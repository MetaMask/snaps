const deepmerge = require('deepmerge');

const baseConfig = require('../../jest.config.base');

module.exports = deepmerge(baseConfig, {
  testTimeout: 30000,
  coverageThreshold: {
    global: {
      branches: 56.71,
      functions: 77.23,
      lines: 84.53,
      statements: 84.29,
    },
  },
});

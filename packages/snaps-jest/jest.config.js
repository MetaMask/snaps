const deepmerge = require('deepmerge');

const baseConfig = require('../../jest.config.base');

module.exports = deepmerge(baseConfig, {
  testTimeout: 30000,
  coverageThreshold: {
    global: {
      branches: 58.2,
      functions: 77.23,
      lines: 84.74,
      statements: 84.5,
    },
  },
});

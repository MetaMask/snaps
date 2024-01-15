const deepmerge = require('deepmerge');

const baseConfig = require('../../jest.config.base');

module.exports = deepmerge(baseConfig, {
  testTimeout: 30000,
  coverageThreshold: {
    global: {
      branches: 55.55,
      functions: 77.16,
      lines: 84.96,
      statements: 84.93,
    },
  },
});

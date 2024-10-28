const deepmerge = require('deepmerge');

const baseConfig = require('../../jest.config.base');

module.exports = deepmerge(baseConfig, {
  testTimeout: 30000,
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 97.22,
      lines: 96.75,
      statements: 96.83,
    },
  },
});

const deepmerge = require('deepmerge');

const baseConfig = require('../../jest.config.base');

module.exports = deepmerge(baseConfig, {
  testTimeout: 30000,
  coverageThreshold: {
    global: {
      branches: 56.45,
      functions: 85.82,
      lines: 88.51,
      statements: 88.45,
    },
  },
});

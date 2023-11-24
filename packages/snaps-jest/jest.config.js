const deepmerge = require('deepmerge');

const baseConfig = require('../../jest.config.base');

module.exports = deepmerge(baseConfig, {
  coverageThreshold: {
    global: {
      branches: 20.89,
      functions: 31.93,
      lines: 53.47,
      statements: 52.85,
    },
  },
});

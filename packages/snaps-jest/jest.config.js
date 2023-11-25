const deepmerge = require('deepmerge');

const baseConfig = require('../../jest.config.base');

module.exports = deepmerge(baseConfig, {
  coverageThreshold: {
    global: {
      branches: 22.38,
      functions: 31.96,
      lines: 53.37,
      statements: 52.77,
    },
  },
});

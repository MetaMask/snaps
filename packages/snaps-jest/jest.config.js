const deepmerge = require('deepmerge');

const baseConfig = require('../../jest.config.base');

module.exports = deepmerge(baseConfig, {
  coverageThreshold: {
    global: {
      branches: 56.06,
      functions: 77.23,
      lines: 84.36,
      statements: 84.13,
    },
  },
});

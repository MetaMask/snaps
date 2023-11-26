const deepmerge = require('deepmerge');

const baseConfig = require('../../jest.config.base');

module.exports = deepmerge(baseConfig, {
  coverageThreshold: {
    global: {
      branches: 46.26,
      functions: 73.98,
      lines: 82.09,
      statements: 81.61,
    },
  },
});

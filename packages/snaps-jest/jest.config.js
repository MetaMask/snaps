const deepmerge = require('deepmerge');

const baseConfig = require('../../jest.config.base');

module.exports = deepmerge(baseConfig, {
  testTimeout: 30000,
  coverageThreshold: {
    global: {
      branches: 54.83,
      functions: 76.27,
      lines: 84.44,
      statements: 84.21,
    },
  },
});

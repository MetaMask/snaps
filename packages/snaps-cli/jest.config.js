const deepmerge = require('deepmerge');

const baseConfig = require('../../jest.config.base');

module.exports = deepmerge(baseConfig, {
  coveragePathIgnorePatterns: ['./src/types'],
  coverageThreshold: {
    global: {
      branches: 97.89,
      functions: 98.07,
      lines: 99.47,
      statements: 99.47,
    },
  },
  setupFiles: ['./test/setup.js'],
  testTimeout: 2500,
});

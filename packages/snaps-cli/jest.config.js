const deepmerge = require('deepmerge');

const baseConfig = require('../../jest.config.base');

module.exports = deepmerge(baseConfig, {
  coveragePathIgnorePatterns: ['./src/types'],
  coverageThreshold: {
    global: {
      branches: 98.09,
      functions: 94.73,
      lines: 98.51,
      statements: 98.52,
    },
  },
  setupFiles: ['./test/setup.js'],
  testTimeout: 2500,
});

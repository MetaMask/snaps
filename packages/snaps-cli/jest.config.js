const deepmerge = require('deepmerge');

const baseConfig = require('../../jest.config.base');

module.exports = deepmerge(baseConfig, {
  coveragePathIgnorePatterns: ['./src/types'],
  coverageThreshold: {
    global: {
      branches: 98.79,
      functions: 94.59,
      lines: 98.49,
      statements: 98.5,
    },
  },
  setupFiles: ['./test/setup.js'],
  testTimeout: 2500,
});

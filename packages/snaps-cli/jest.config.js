const deepmerge = require('deepmerge');

const baseConfig = require('../../jest.config.base');

module.exports = deepmerge(baseConfig, {
  coveragePathIgnorePatterns: ['./src/types'],
  coverageThreshold: {
    global: {
      branches: 98.64,
      functions: 93.75,
      lines: 98.09,
      statements: 98.11,
    },
  },
  setupFiles: ['./test/setup.js'],
});

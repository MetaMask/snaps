const deepmerge = require('deepmerge');
const baseConfig = require('../../jest.config.base');

module.exports = deepmerge(baseConfig, {
  coveragePathIgnorePatterns: ['./src/types'],
  coverageThreshold: {
    global: {
      branches: 98.88,
      functions: 98.07,
      lines: 99.86,
      statements: 99.86,
    },
  },
  setupFiles: ['./test/setup.js'],
  testTimeout: 2500,
});

const deepmerge = require('deepmerge');

const baseConfig = require('../../jest.config.base');

module.exports = deepmerge(baseConfig, {
  coveragePathIgnorePatterns: ['./src/types'],
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 99.26,
      statements: 99.27,
    },
  },
  setupFiles: ['./test/setup.js'],
});

const deepmerge = require('deepmerge');
const baseConfig = require('../../jest.config.base');

module.exports = deepmerge(baseConfig, {
  coveragePathIgnorePatterns: ['./src/index.ts'],
  coverageThreshold: {
    global: {
      branches: 43.52,
      functions: 59.74,
      lines: 48.27,
      statements: 48.04,
    },
  },
  testTimeout: 2500,
});

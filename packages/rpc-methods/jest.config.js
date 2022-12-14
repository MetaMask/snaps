const deepmerge = require('deepmerge');

const baseConfig = require('../../jest.config.base');

module.exports = deepmerge(baseConfig, {
  coveragePathIgnorePatterns: ['./src/index.ts'],
  coverageThreshold: {
    global: {
      branches: 74.63,
      functions: 83.33,
      lines: 83.46,
      statements: 82.44,
    },
  },
  testTimeout: 2500,
});

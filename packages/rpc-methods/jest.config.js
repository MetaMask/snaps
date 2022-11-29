const deepmerge = require('deepmerge');

const baseConfig = require('../../jest.config.base');

module.exports = deepmerge(baseConfig, {
  coveragePathIgnorePatterns: ['./src/index.ts'],
  coverageThreshold: {
    global: {
      branches: 87.09,
      functions: 87.27,
      lines: 83.27,
      statements: 83.27,
    },
  },
  testTimeout: 2500,
});

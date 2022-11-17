const deepmerge = require('deepmerge');

const baseConfig = require('../../jest.config.base');

module.exports = deepmerge(baseConfig, {
  coveragePathIgnorePatterns: ['./src/index.ts'],
  coverageThreshold: {
    global: {
      branches: 86.84,
      functions: 87.27,
      lines: 83.18,
      statements: 83.18,
    },
  },
  testTimeout: 2500,
});

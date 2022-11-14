const deepmerge = require('deepmerge');
const baseConfig = require('../../jest.config.base');

module.exports = deepmerge(baseConfig, {
  coveragePathIgnorePatterns: ['./src/index.ts'],
  coverageThreshold: {
    global: {
      branches: 87.5,
      functions: 88.13,
      lines: 80.89,
      statements: 80.89,
    },
  },
  testTimeout: 2500,
});

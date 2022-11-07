const deepmerge = require('deepmerge');
const baseConfig = require('../../jest.config.base');

module.exports = deepmerge(baseConfig, {
  coveragePathIgnorePatterns: ['./src/index.ts'],
  coverageThreshold: {
    global: {
      branches: 88.63,
      functions: 86.53,
      lines: 79.23,
      statements: 79.23,
    },
  },
  testTimeout: 2500,
});

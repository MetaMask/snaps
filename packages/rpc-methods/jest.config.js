const deepmerge = require('deepmerge');
const baseConfig = require('../../jest.config.base');

module.exports = deepmerge(baseConfig, {
  coveragePathIgnorePatterns: ['./src/index.ts'],
  coverageThreshold: {
    global: {
      branches: 82.85,
      functions: 80.85,
      lines: 59.77,
      statements: 59.77,
    },
  },
  testTimeout: 2500,
});

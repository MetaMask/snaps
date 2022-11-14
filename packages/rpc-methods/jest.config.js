const deepmerge = require('deepmerge');
const baseConfig = require('../../jest.config.base');

module.exports = deepmerge(baseConfig, {
  coveragePathIgnorePatterns: ['./src/index.ts'],
  coverageThreshold: {
    global: {
      branches: 87.01,
      functions: 87.03,
      lines: 79,
      statements: 79,
    },
  },
  testTimeout: 2500,
});

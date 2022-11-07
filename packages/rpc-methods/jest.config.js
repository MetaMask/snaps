const deepmerge = require('deepmerge');
const baseConfig = require('../../jest.config.base');

module.exports = deepmerge(baseConfig, {
  coveragePathIgnorePatterns: ['./src/index.ts'],
  coverageThreshold: {
    global: {
      branches: 89.47,
      functions: 73.33,
      lines: 47.42,
      statements: 47.42,
    },
  },
  testTimeout: 2500,
});

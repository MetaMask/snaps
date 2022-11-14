const deepmerge = require('deepmerge');
const baseConfig = require('../../jest.config.base');

module.exports = deepmerge(baseConfig, {
  coveragePathIgnorePatterns: ['./src/index.ts'],
  coverageThreshold: {
    global: {
      branches: 88.05,
      functions: 89.65,
      lines: 84.11,
      statements: 84.11,
    },
  },
  testTimeout: 2500,
});

const deepmerge = require('deepmerge');
const baseConfig = require('../../jest.config.base');

module.exports = deepmerge(baseConfig, {
  coveragePathIgnorePatterns: ['./src/index.ts'],
  coverageThreshold: {
    global: {
      branches: 85.82,
      functions: 80,
      lines: 60.29,
      statements: 60.29,
    },
  },
  testTimeout: 2500,
});

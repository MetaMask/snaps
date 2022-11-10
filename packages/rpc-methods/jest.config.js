const deepmerge = require('deepmerge');

const baseConfig = require('../../jest.config.base');

module.exports = deepmerge(baseConfig, {
  coveragePathIgnorePatterns: ['./src/index.ts'],
  coverageThreshold: {
    global: {
      branches: 85.82,
      functions: 80,
      lines: 60.24,
      statements: 60.24,
    },
  },
  testTimeout: 2500,
});

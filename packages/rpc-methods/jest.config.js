const deepmerge = require('deepmerge');

const baseConfig = require('../../jest.config.base');

module.exports = deepmerge(baseConfig, {
  collectCoverageFrom: [
    './src/**/*.ts',
    '!./src/**/*.test.ts',
    '!./src/**/index.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 78.91,
      functions: 87.83,
      lines: 89.12,
      statements: 88.77,
    },
  },
  testTimeout: 2500,
});

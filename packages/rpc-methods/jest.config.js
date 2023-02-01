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
      branches: 75.36,
      functions: 87.67,
      lines: 88.56,
      statements: 88.21,
    },
  },
  testTimeout: 2500,
});

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
      branches: 74.81,
      functions: 87.32,
      lines: 88.55,
      statements: 88.2,
    },
  },
  testTimeout: 2500,
});

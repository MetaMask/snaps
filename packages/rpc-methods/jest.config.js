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
      branches: 78.73,
      functions: 88.88,
      lines: 89.1,
      statements: 88.78,
    },
  },
  testTimeout: 2500,
});

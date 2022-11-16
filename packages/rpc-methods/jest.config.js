const deepmerge = require('deepmerge');
const baseConfig = require('../../jest.config.base');

module.exports = deepmerge(baseConfig, {
  coveragePathIgnorePatterns: ['./src/index.ts'],
  coverageThreshold: {
    global: {
      branches: 87.41,
      functions: 87.27,
      lines: 83.36,
      statements: 83.36,
    },
  },
  testTimeout: 2500,
});

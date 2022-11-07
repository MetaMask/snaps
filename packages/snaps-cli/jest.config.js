const deepmerge = require('deepmerge');
const baseConfig = require('../../jest.config.base');

module.exports = deepmerge(baseConfig, {
  coveragePathIgnorePatterns: [
    './src/test-utils',
    // These are just type declarations.
    './src/types/*',
  ],
  setupFiles: ['./test/setup.js'],
  testTimeout: 2500,
});

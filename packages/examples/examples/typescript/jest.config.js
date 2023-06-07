const deepmerge = require('deepmerge');

const baseConfig = require('../../../../jest.config.base');

module.exports = deepmerge(baseConfig, {
  preset: '@metamask/snaps-jest',
  testEnvironmentOptions: {
    browser: {
      headless: true,
    },
  },

  collectCoverage: false,

  // A map from regular expressions to module names or to arrays of module names that allow to stub out resources with a single module
  moduleNameMapper: {
    '^@metamask/(.+)/test-utils$': ['<rootDir>/../../../$1/src/test-utils'],
    '^@metamask/(.+)$': [
      '<rootDir>/../../../$1/src',
      '<rootDir>/../../../../node_modules/@metamask/$1',
      '<rootDir>/node_modules/@metamask/$1',
    ],
  },
});

const deepmerge = require('deepmerge');

const baseConfig = require('../../../../jest.config.base');

module.exports = deepmerge(baseConfig, {
  preset: '@metamask/snaps-jest',
  testEnvironmentOptions: {
    server: {
      // For this particular example we have to configure a port, as the snap
      // uses `snap_getEntropy`, which uses the snap ID
      // (`local:http://localhost:PORT`) to derive entropy. If we were to use a
      // random port every time, the derived entropy would be different for
      // every test run, making our tests non-deterministic.
      port: 48935,
    },
  },

  // Since `@metamask/snaps-jest` runs in the browser, we can't collect
  // coverage information.
  collectCoverage: false,

  // This is required for the tests to run inside the `MetaMask/snaps`
  // repository. You don't need this in your own project.
  moduleNameMapper: {
    '^@metamask/(.+)$': [
      '<rootDir>/../../../$1/src',
      '<rootDir>/../../../../node_modules/@metamask/$1',
      '<rootDir>/node_modules/@metamask/$1',
    ],
  },
});

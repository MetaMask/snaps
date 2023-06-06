/* eslint-disable jsdoc/valid-types */

const { resolve } = require('path');

/**
 * @type {import('jest').Config}
 */
const config = {
  testEnvironment: '@metamask/snaps-jest',

  // `@metamask/snaps-jest` requires `jest-circus` to be the test runner.
  testRunner: 'jest-circus/runner',

  setupFilesAfterEnv: [resolve(__dirname, 'dist', 'setup.js')],
};

module.exports = config;

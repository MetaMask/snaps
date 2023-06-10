/* eslint-disable jsdoc/valid-types */

const { resolve } = require('path');

/**
 * @type {import('jest').Config}
 */
const config = {
  testEnvironment: '@metamask/snaps-jest',

  // End-to-end tests can take longer than usual to run, so we set the test
  // timeout to 10 seconds by default.
  testTimeout: 10000,

  setupFilesAfterEnv: [resolve(__dirname, 'dist', 'setup.js')],
};

module.exports = config;

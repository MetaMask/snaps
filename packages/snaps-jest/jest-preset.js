/* eslint-disable jsdoc/valid-types */

const { resolve } = require('path');

/**
 * @type {import('jest').Config}
 */
const config = {
  testEnvironment: '@metamask/snaps-jest',

  // End-to-end tests can take longer than usual to run, so we set the test
  // timeout to 30 seconds by default.
  testTimeout: 30000,

  setupFilesAfterEnv: [resolve(__dirname, 'dist', 'cjs', 'setup.js')],
};

module.exports = config;

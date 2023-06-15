/* eslint-disable jsdoc/valid-types */

const { resolve } = require('path');

/**
 * @type {import('jest').Config}
 */
const config = {
  testEnvironment: '@metamask/snaps-jest',

  setupFilesAfterEnv: [resolve(__dirname, 'dist', 'setup.js')],
};

module.exports = config;

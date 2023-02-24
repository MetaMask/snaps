/* eslint-disable */
const { TestEnvironment } = require('jest-environment-node');

// Custom test environment copied from https://github.com/jsdom/jsdom/issues/2524
// in order to add TextEncoder to jsdom. TextEncoder is expected by jose.

module.exports = class CustomTestEnvironment extends TestEnvironment {
  async setup() {
    await super.setup();

    this.global.harden = (param) => param;
  }
};

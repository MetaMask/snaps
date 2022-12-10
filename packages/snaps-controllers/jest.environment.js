/* eslint-disable */
const { TestEnvironment } = require('jest-environment-jsdom');

// Custom test environment copied from https://github.com/jsdom/jsdom/issues/2524
// in order to add `TextEncoder`, `TextDecoder`, and a few other globals to
// `jsdom`.

module.exports = class CustomTestEnvironment extends TestEnvironment {
  async setup() {
    await super.setup();
    if (typeof this.global.TextEncoder === 'undefined') {
      const { TextEncoder, TextDecoder } = require('util');

      this.global.TextEncoder = TextEncoder;
      this.global.TextDecoder = TextDecoder;
      this.global.ArrayBuffer = ArrayBuffer;
      this.global.Uint8Array = Uint8Array;

      const oldCreateElement = this.global.document.createElement.bind(
        this.global.document,
      );

      // This is a hack to get around the fact that `jsdom` doesn't add globals
      // to the `window` object for created windows. This is a problem because
      // we need `TextEncoder` and `TextDecoder` to test the iframe execution
      // environment.
      // TODO: Remove this once `jsdom` properly supports `TextEncoder` and
      // `TextDecoder`.
      this.global.document.createElement = (...args) => {
        const element = oldCreateElement(...args);
        const symbol = Reflect.ownKeys(element).find((s) => {
          return String(s) === 'Symbol(impl)';
        });

        const implementation = element[symbol];
        const oldAttach = implementation._attach.bind(implementation);
        implementation._attach = (...args) => {
          oldAttach(...args);
          implementation._contentDocument._defaultView.TextEncoder = TextEncoder;
          implementation._contentDocument._defaultView.TextDecoder = TextDecoder;
        }

        return element;
      };
    }
  }
};

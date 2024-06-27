"use strict";Object.defineProperty(exports, "__esModule", {value: true});


var _chunkGLPGOEVEjs = require('./chunk-GLPGOEVE.js');

// src/matchers.ts
var _globals = require('@jest/globals');
var _jsx = require('@metamask/snaps-sdk/jsx');



var _snapsutils = require('@metamask/snaps-utils');
var _superstruct = require('@metamask/superstruct');
var _utils = require('@metamask/utils');








var _jestmatcherutils = require('jest-matcher-utils');
function assertActualIsSnapResponse(actual, matcherName, options) {
  if (!_superstruct.is.call(void 0, actual, _chunkGLPGOEVEjs.SnapResponseStruct)) {
    throw new Error(
      _jestmatcherutils.matcherErrorMessage.call(void 0, 
        _jestmatcherutils.matcherHint.call(void 0, matcherName, void 0, void 0, options),
        `${_jestmatcherutils.RECEIVED_COLOR.call(void 0, 
          "received"
        )} value must be a response from the \`request\` function`,
        _jestmatcherutils.printWithType.call(void 0, "Received", actual, _jestmatcherutils.printReceived)
      )
    );
  }
}
function assertHasInterface(actual, matcherName, options) {
  if (!_superstruct.is.call(void 0, actual, _chunkGLPGOEVEjs.InterfaceStruct) || !actual.content) {
    throw new Error(
      _jestmatcherutils.matcherErrorMessage.call(void 0, 
        _jestmatcherutils.matcherHint.call(void 0, matcherName, void 0, void 0, options),
        `${_jestmatcherutils.RECEIVED_COLOR.call(void 0, "received")} value must have a \`content\` property`,
        _jestmatcherutils.printWithType.call(void 0, "Received", actual, _jestmatcherutils.printReceived)
      )
    );
  }
}
var toRespondWith = function(actual, expected) {
  assertActualIsSnapResponse(actual, "toRespondWith");
  const { response } = actual;
  if (_utils.hasProperty.call(void 0, response, "error")) {
    const message2 = () => `${this.utils.matcherHint(".toRespondWith")}

Expected response: ${this.utils.printExpected(expected)}
Received error: ${this.utils.printReceived(response.error)}`;
    return { message: message2, pass: false };
  }
  const pass = this.equals(response.result, expected);
  const message = pass ? () => `${this.utils.matcherHint(".not.toRespondWith")}

Expected: ${this.utils.printExpected(expected)}
Received: ${this.utils.printReceived(response.result)}` : () => `${this.utils.matcherHint(".toRespondWith")}

Expected: ${this.utils.printExpected(expected)}
Received: ${this.utils.printReceived(response.result)}`;
  return { message, pass };
};
var toRespondWithError = function(actual, expected) {
  assertActualIsSnapResponse(actual, "toRespondWithError");
  const { response } = actual;
  if (_utils.hasProperty.call(void 0, response, "result")) {
    const message2 = () => `${this.utils.matcherHint(".toRespondWithError")}

Expected error: ${this.utils.printExpected(expected)}
Received result: ${this.utils.printReceived(response.result)}`;
    return { message: message2, pass: false };
  }
  const pass = this.equals(response.error, expected);
  const message = pass ? () => `${this.utils.matcherHint(".not.toRespondWithError")}

Expected: ${this.utils.printExpected(expected)}
Received: ${this.utils.printReceived(response.error)}` : () => `${this.utils.matcherHint(".toRespondWithError")}

Expected: ${this.utils.printExpected(expected)}
Received: ${this.utils.printReceived(response.error)}`;
  return { message, pass };
};
var toSendNotification = function(actual, expected, type) {
  assertActualIsSnapResponse(actual, "toSendNotification");
  const { notifications } = actual;
  const pass = notifications.some(
    (notification) => this.equals(notification.message, expected) && (type === void 0 || notification.type === type)
  );
  const message = pass ? () => `${this.utils.matcherHint(".not.toSendNotification")}

Expected: ${this.utils.printExpected(expected)}
Expected type: ${this.utils.printExpected(type)}
Received: ${this.utils.printReceived(notifications)}` : () => `${this.utils.matcherHint(".toSendNotification")}

Expected: ${this.utils.printExpected(expected)}
Expected type: ${this.utils.printExpected(type)}
Received: ${this.utils.printReceived(notifications)}`;
  return { message, pass };
};
var toRenderLegacy = function(actual, expected) {
  assertHasInterface(actual, "toRender");
  const { content } = actual;
  const expectedElement = _snapsutils.getJsxElementFromComponent.call(void 0, expected);
  const pass = this.equals(content, expectedElement);
  const difference = _jestmatcherutils.diff.call(void 0, expectedElement, content);
  const message = pass ? () => `${this.utils.matcherHint(".not.toRender")}

Expected:
${this.utils.printExpected(expectedElement)}

Received:
${this.utils.printReceived(content)}

Difference:

${difference}` : () => `${this.utils.matcherHint(".toRender")}

Expected:
${this.utils.printExpected(expectedElement)}

Received:
${this.utils.printReceived(content)}

Difference:

${difference}`;
  return { message, pass };
};
var toRender = function(actual, expected) {
  assertHasInterface(actual, "toRender");
  if (!_jsx.isJSXElementUnsafe.call(void 0, expected)) {
    return toRenderLegacy.call(this, actual, expected);
  }
  const { content } = actual;
  const pass = this.equals(content, expected);
  const difference = _jestmatcherutils.diff.call(void 0, 
    _snapsutils.serialiseJsx.call(void 0, expected),
    _snapsutils.serialiseJsx.call(void 0, content)
  );
  const message = pass ? () => `${this.utils.matcherHint(".not.toRender")}

Expected:
${_jestmatcherutils.EXPECTED_COLOR.call(void 0, _snapsutils.serialiseJsx.call(void 0, expected))}

Received:
${_jestmatcherutils.RECEIVED_COLOR.call(void 0, _snapsutils.serialiseJsx.call(void 0, content))}

Difference:

${difference}` : () => `${this.utils.matcherHint(".toRender")}

Expected:
${_jestmatcherutils.EXPECTED_COLOR.call(void 0, _snapsutils.serialiseJsx.call(void 0, expected))}

Received:
${_jestmatcherutils.RECEIVED_COLOR.call(void 0, _snapsutils.serialiseJsx.call(void 0, content))}

Difference:

${difference}`;
  return { message, pass };
};
_globals.expect.extend({
  toRespondWith,
  toRespondWithError,
  toSendNotification,
  toRender
});






exports.toRespondWith = toRespondWith; exports.toRespondWithError = toRespondWithError; exports.toSendNotification = toSendNotification; exports.toRender = toRender;
//# sourceMappingURL=chunk-Y2U3ZPCK.js.map
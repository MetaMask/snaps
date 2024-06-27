import {
  InterfaceStruct,
  SnapResponseStruct
} from "./chunk-C26TYXXD.mjs";

// src/matchers.ts
import { expect } from "@jest/globals";
import { isJSXElementUnsafe } from "@metamask/snaps-sdk/jsx";
import {
  getJsxElementFromComponent,
  serialiseJsx
} from "@metamask/snaps-utils";
import { is } from "@metamask/superstruct";
import { hasProperty } from "@metamask/utils";
import {
  EXPECTED_COLOR,
  diff,
  matcherErrorMessage,
  matcherHint,
  printReceived,
  printWithType,
  RECEIVED_COLOR
} from "jest-matcher-utils";
function assertActualIsSnapResponse(actual, matcherName, options) {
  if (!is(actual, SnapResponseStruct)) {
    throw new Error(
      matcherErrorMessage(
        matcherHint(matcherName, void 0, void 0, options),
        `${RECEIVED_COLOR(
          "received"
        )} value must be a response from the \`request\` function`,
        printWithType("Received", actual, printReceived)
      )
    );
  }
}
function assertHasInterface(actual, matcherName, options) {
  if (!is(actual, InterfaceStruct) || !actual.content) {
    throw new Error(
      matcherErrorMessage(
        matcherHint(matcherName, void 0, void 0, options),
        `${RECEIVED_COLOR("received")} value must have a \`content\` property`,
        printWithType("Received", actual, printReceived)
      )
    );
  }
}
var toRespondWith = function(actual, expected) {
  assertActualIsSnapResponse(actual, "toRespondWith");
  const { response } = actual;
  if (hasProperty(response, "error")) {
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
  if (hasProperty(response, "result")) {
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
  const expectedElement = getJsxElementFromComponent(expected);
  const pass = this.equals(content, expectedElement);
  const difference = diff(expectedElement, content);
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
  if (!isJSXElementUnsafe(expected)) {
    return toRenderLegacy.call(this, actual, expected);
  }
  const { content } = actual;
  const pass = this.equals(content, expected);
  const difference = diff(
    serialiseJsx(expected),
    serialiseJsx(content)
  );
  const message = pass ? () => `${this.utils.matcherHint(".not.toRender")}

Expected:
${EXPECTED_COLOR(serialiseJsx(expected))}

Received:
${RECEIVED_COLOR(serialiseJsx(content))}

Difference:

${difference}` : () => `${this.utils.matcherHint(".toRender")}

Expected:
${EXPECTED_COLOR(serialiseJsx(expected))}

Received:
${RECEIVED_COLOR(serialiseJsx(content))}

Difference:

${difference}`;
  return { message, pass };
};
expect.extend({
  toRespondWith,
  toRespondWithError,
  toSendNotification,
  toRender
});

export {
  toRespondWith,
  toRespondWithError,
  toSendNotification,
  toRender
};
//# sourceMappingURL=chunk-7PCHIR6O.mjs.map
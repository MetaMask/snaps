// Note: Because this file imports from `@jest/globals`, it can only be used in
// a Jest environment. This is why it's not exported from the index file.

import type { MatcherFunction } from '@jest/expect';
import { expect } from '@jest/globals';
import type {
  EnumToUnion,
  ComponentOrElement,
  Component,
  NotificationType,
  TrackableError,
} from '@metamask/snaps-sdk';
import type { JSXElement, SnapNode } from '@metamask/snaps-sdk/jsx';
import { isJSXElementUnsafe, JSXElementStruct } from '@metamask/snaps-sdk/jsx';
import type { SnapResponse } from '@metamask/snaps-simulation';
import {
  InterfaceStruct,
  SnapResponseStruct,
} from '@metamask/snaps-simulation';
import {
  getJsxElementFromComponent,
  serialiseJsx,
} from '@metamask/snaps-utils';
import { is } from '@metamask/superstruct';
import type { Json } from '@metamask/utils';
import { hasProperty } from '@metamask/utils';
import type { MatcherHintOptions } from 'jest-matcher-utils';
import {
  EXPECTED_COLOR,
  diff,
  matcherErrorMessage,
  matcherHint,
  printReceived,
  printWithType,
  RECEIVED_COLOR,
} from 'jest-matcher-utils';

/**
 * Ensure that the actual value is a response from the `request` function.
 *
 * @param actual - The actual value.
 * @param matcherName - The name of the matcher.
 * @param options - The matcher options.
 */
function assertActualIsSnapResponse(
  actual: unknown,
  matcherName: string,
  options?: MatcherHintOptions,
): asserts actual is SnapResponse {
  if (!is(actual, SnapResponseStruct)) {
    throw new Error(
      matcherErrorMessage(
        matcherHint(matcherName, undefined, undefined, options),
        `${RECEIVED_COLOR(
          'received',
        )} value must be a response from the \`request\` function`,
        printWithType('Received', actual, printReceived),
      ),
    );
  }
}

/**
 * Ensure that the actual value is a response from the `request` function, and
 * that it has a `ui` property.
 *
 * @param actual - The actual value.
 * @param matcherName - The name of the matcher.
 * @param options - The matcher options.
 */
function assertHasInterface(
  actual: unknown,
  matcherName: string,
  options?: MatcherHintOptions,
): asserts actual is { content: JSXElement } {
  if (!is(actual, InterfaceStruct) || !actual.content) {
    throw new Error(
      matcherErrorMessage(
        matcherHint(matcherName, undefined, undefined, options),
        `${RECEIVED_COLOR('received')} value must have a \`content\` property`,
        printWithType('Received', actual, printReceived),
      ),
    );
  }
}

/**
 * Check if a JSON-RPC response matches the expected value. This matcher is
 * intended to be used with the `expect` global.
 *
 * @param actual - The actual response.
 * @param expected - The expected response.
 * @returns The status and message.
 */
export const toRespondWith: MatcherFunction<[expected: Json]> = function (
  actual,
  expected,
) {
  assertActualIsSnapResponse(actual, 'toRespondWith');

  const { response } = actual;
  if (hasProperty(response, 'error')) {
    const message = () =>
      `${this.utils.matcherHint('.toRespondWith')}\n\n` +
      `Expected response: ${this.utils.printExpected(expected)}\n` +
      `Received error: ${this.utils.printReceived(response.error)}`;

    return { message, pass: false };
  }

  const pass = this.equals(response.result, expected);
  const message = pass
    ? () =>
        `${this.utils.matcherHint('.not.toRespondWith')}\n\n` +
        `Expected: ${this.utils.printExpected(expected)}\n` +
        `Received: ${this.utils.printReceived(response.result)}`
    : () =>
        `${this.utils.matcherHint('.toRespondWith')}\n\n` +
        `Expected: ${this.utils.printExpected(expected)}\n` +
        `Received: ${this.utils.printReceived(response.result)}`;

  return { message, pass };
};

export const toRespondWithError: MatcherFunction<[expected: Json]> = function (
  actual,
  expected,
) {
  assertActualIsSnapResponse(actual, 'toRespondWithError');

  const { response } = actual;
  if (hasProperty(response, 'result')) {
    const message = () =>
      `${this.utils.matcherHint('.toRespondWithError')}\n\n` +
      `Expected error: ${this.utils.printExpected(expected)}\n` +
      `Received result: ${this.utils.printReceived(response.result)}`;

    return { message, pass: false };
  }

  const pass = this.equals(response.error, expected);
  const message = pass
    ? () =>
        `${this.utils.matcherHint('.not.toRespondWithError')}\n\n` +
        `Expected: ${this.utils.printExpected(expected)}\n` +
        `Received: ${this.utils.printReceived(response.error)}`
    : () =>
        `${this.utils.matcherHint('.toRespondWithError')}\n\n` +
        `Expected: ${this.utils.printExpected(expected)}\n` +
        `Received: ${this.utils.printReceived(response.error)}`;

  return { message, pass };
};

/**
 * Check if the snap sent a notification with the expected message. This matcher
 * is intended to be used with the `expect` global.
 *
 * @param actual - The actual response.
 * @param expectedMessage - The expected notification message.
 * @param expectedType - The expected notification type.
 * @param expectedTitle - The expected notification title.
 * @param expectedContent - The expected notification JSX content.
 * @param expectedFooterLink - The expected footer link object.
 * @returns The status and message.
 */
export const toSendNotification: MatcherFunction<
  [
    expectedMessage: string,
    expectedType?: EnumToUnion<NotificationType> | undefined,
    expectedTitle?: string | undefined,
    expectedContent?: JSXElement | undefined,
    expectedFooterLink?: { text: string; href: string } | undefined,
  ]
> = function (
  actual,
  expectedMessage,
  expectedType,
  expectedTitle,
  expectedContent,
  expectedFooterLink,
) {
  assertActualIsSnapResponse(actual, 'toSendNotification');

  const { notifications } = actual;
  let jsxContent: JSXElement | undefined;

  if ('getInterface' in actual) {
    jsxContent = actual.getInterface().content;
  }

  const notificationValidator = (
    notification: SnapResponse['notifications'][number],
  ) => {
    const { type, message, title, footerLink } = notification as Record<
      string,
      unknown
    >;

    if (!this.equals(message, expectedMessage)) {
      return false;
    }

    if (expectedType && type !== expectedType) {
      return false;
    }

    if (title && !this.equals(title, expectedTitle)) {
      return false;
    }

    if (jsxContent && !this.equals(jsxContent, expectedContent)) {
      return false;
    }

    if (footerLink && !this.equals(footerLink, expectedFooterLink)) {
      return false;
    }

    return true;
  };

  const pass = notifications.some(notificationValidator);

  const transformedNotifications = notifications.map((notification) => {
    return {
      ...notification,
      // Ok to cast here as the function returns if the param is falsy
      content: serialiseJsx(jsxContent as SnapNode),
    };
  });

  const message = () => {
    let testMessage = pass
      ? `${this.utils.matcherHint('.not.toSendNotification')}\n\n`
      : `${this.utils.matcherHint('.toSendNotification')}\n\n`;

    const {
      title,
      type,
      message: notifMessage,
      footerLink,
      content,
    } = transformedNotifications[0];

    testMessage += `Expected message: ${this.utils.printExpected(
      expectedMessage,
    )}\n`;

    if (expectedType) {
      testMessage += `Expected type: ${this.utils.printExpected(
        expectedType,
      )}\n`;
    }

    if (title) {
      testMessage += `Expected title: ${this.utils.printExpected(
        expectedTitle,
      )}\n`;

      // We want to check if the expected content is actually JSX content, otherwise `serialiseJsx` won't return something useful.
      if (is(expectedContent, JSXElementStruct)) {
        testMessage += `Expected content: ${this.utils.printExpected(
          serialiseJsx(expectedContent),
        )}\n`;
      } else {
        testMessage += `Expected content: ${this.utils.printExpected(
          expectedContent,
        )}\n`;
      }
    }

    if (footerLink) {
      testMessage += `Expected footer link: ${this.utils.printExpected(
        expectedFooterLink,
      )}\n`;
    }

    testMessage += `Received message: ${this.utils.printExpected(
      notifMessage,
    )}\n`;

    if (expectedType) {
      testMessage += `Received type: ${this.utils.printReceived(type)}\n`;
    }

    if (title) {
      testMessage += `Received title: ${this.utils.printReceived(title)}\n`;
      testMessage += `Received content: ${this.utils.printReceived(
        serialiseJsx(content),
      )}\n`;
    }

    if (footerLink) {
      testMessage += `Received footer link: ${this.utils.printReceived(
        footerLink,
      )}\n`;
    }

    return testMessage;
  };

  return { message, pass };
};

const toRenderLegacy: MatcherFunction<[expected: Component]> = function (
  actual,
  expected,
) {
  assertHasInterface(actual, 'toRender');

  const { content } = actual;
  const expectedElement = getJsxElementFromComponent(expected);
  const pass = this.equals(content, expectedElement);

  // This is typed as `string | null`, but in practice it's always a string.
  // The function only returns `null` if both the expected and actual values
  // are numbers, bigints, or booleans, which is never the case here.
  const difference = diff(expectedElement, content) as string;

  const message = pass
    ? () =>
        `${this.utils.matcherHint('.not.toRender')}\n\n` +
        `Expected:\n${this.utils.printExpected(expectedElement)}\n\n` +
        `Received:\n${this.utils.printReceived(content)}` +
        `\n\nDifference:\n\n${difference}`
    : () =>
        `${this.utils.matcherHint('.toRender')}\n\n` +
        `Expected:\n${this.utils.printExpected(expectedElement)}\n\n` +
        `Received:\n${this.utils.printReceived(content)}` +
        `\n\nDifference:\n\n${difference}`;

  return { message, pass };
};

export const toRender: MatcherFunction<[expected: ComponentOrElement]> =
  // This should not return a promise.
  // eslint-disable-next-line @typescript-eslint/promise-function-async
  function (actual, expected) {
    assertHasInterface(actual, 'toRender');

    if (!isJSXElementUnsafe(expected)) {
      return toRenderLegacy.call(this, actual, expected);
    }

    const { content } = actual;
    const pass = this.equals(content, expected);

    // This is typed as `string | null`, but in practice it's always a string.
    // The function only returns `null` if both the expected and actual values
    // are numbers, bigints, or booleans, which is never the case here.
    const difference = diff(
      serialiseJsx(expected),
      serialiseJsx(content),
    ) as string;

    const message = pass
      ? () =>
          `${this.utils.matcherHint('.not.toRender')}\n\n` +
          `Expected:\n${EXPECTED_COLOR(serialiseJsx(expected))}\n\n` +
          `Received:\n${RECEIVED_COLOR(serialiseJsx(content))}` +
          `\n\nDifference:\n\n${difference}`
      : () =>
          `${this.utils.matcherHint('.toRender')}\n\n` +
          `Expected:\n${EXPECTED_COLOR(serialiseJsx(expected))}\n\n` +
          `Received:\n${RECEIVED_COLOR(serialiseJsx(content))}` +
          `\n\nDifference:\n\n${difference}`;

    return { message, pass };
  };

export const toTrackError: MatcherFunction<
  [errorData?: Partial<TrackableError>]
> = function (actual, errorData) {
  assertActualIsSnapResponse(actual, 'toTrackError');

  const errorValidator = (error: SnapResponse['tracked']['errors'][number]) => {
    if (!errorData) {
      // If no error data is provided, we just check for the existence of an error.
      return true;
    }

    return this.equals(error, errorData);
  };

  const { errors } = actual.tracked;
  const pass = errors.some(errorValidator);

  const message = pass
    ? () =>
        `${this.utils.matcherHint('.not.toTrackError')}\n\n` +
        `Expected not to track error with data: ${this.utils.printExpected(
          errorData,
        )}\n` +
        `Received errors: ${this.utils.printReceived(errors)}`
    : () =>
        `${this.utils.matcherHint('.toTrackError')}\n\n` +
        `Expected to track error with data: ${this.utils.printExpected(
          errorData,
        )}\n` +
        `Received errors: ${this.utils.printReceived(errors)}`;

  return { message, pass };
};

export const toTrackEvent: MatcherFunction<[eventData?: Json | undefined]> =
  function (actual, eventData) {
    assertActualIsSnapResponse(actual, 'toTrackEvent');

    const eventValidator = (
      event: SnapResponse['tracked']['events'][number],
    ) => {
      if (!eventData) {
        // If no event data is provided, we just check for the existence of an event.
        return true;
      }

      return this.equals(event, eventData);
    };

    const { events } = actual.tracked;
    const pass = events.some(eventValidator);

    const message = pass
      ? () =>
          `${this.utils.matcherHint('.not.toTrackEvent')}\n\n` +
          `Expected not to track event with data: ${this.utils.printExpected(
            eventData,
          )}\n` +
          `Received events: ${this.utils.printReceived(events)}`
      : () =>
          `${this.utils.matcherHint('.toTrackEvent')}\n\n` +
          `Expected to track event with data: ${this.utils.printExpected(
            eventData,
          )}\n` +
          `Received events: ${this.utils.printReceived(events)}`;

    return { message, pass };
  };

expect.extend({
  toRespondWith,
  toRespondWithError,
  toSendNotification,
  toRender,
  toTrackError,
  toTrackEvent,
});

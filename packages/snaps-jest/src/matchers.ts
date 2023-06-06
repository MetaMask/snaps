/* eslint-disable no-invalid-this */

// Note: Because this file imports from `@jest/globals`, it can only be used in
// a Jest environment. This is why it's not exported from the index file.

import { expect } from '@jest/globals';
import { hasProperty, Json } from '@metamask/utils';
import type { MatcherFunction } from 'expect';
import {
  matcherErrorMessage,
  matcherHint,
  MatcherHintOptions,
  printReceived,
  printWithType,
  RECEIVED_COLOR,
} from 'jest-matcher-utils';
import { is } from 'superstruct';

import { SnapResponse, SnapResponseStruct } from './types';

/**
 * Ensure that the actual value is a response from the `request` function.
 *
 * @param actual - The actual value.
 * @param matcherName - The name of the matcher.
 * @param options - The matcher options.
 */
export function assertActualIsSnapResponse(
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
 * Check if a JSON-RPC response matches the expected value. This matcher is
 * intended to be used with the `expect` global.
 *
 * @param actual - The actual response.
 * @param expected - The expected response.
 * @returns The status and message.
 */
export const toRespondWith: MatcherFunction<[expected: Json]> = function (
  actual: unknown,
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
  actual: unknown,
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
 * @param expected - The expected notification message.
 * @returns The status and message.
 */
export const toSendNotification: MatcherFunction<[expected: string]> =
  async function (actual: unknown, expected) {
    assertActualIsSnapResponse(actual, 'toSendNotification');

    const { notifications } = actual;
    const pass = notifications.some((notification) =>
      this.equals(notification.message, expected),
    );

    const message = pass
      ? () =>
          `${this.utils.matcherHint('.not.toSendNotification')}\n\n` +
          `Expected: ${this.utils.printExpected(expected)}\n` +
          `Received: ${this.utils.printReceived(notifications)}`
      : () =>
          `${this.utils.matcherHint('.toSendNotification')}\n\n` +
          `Expected: ${this.utils.printExpected(expected)}\n` +
          `Received: ${this.utils.printReceived(notifications)}`;

    return { message, pass };
  };

expect.extend({ toRespondWith, toRespondWithError, toSendNotification });

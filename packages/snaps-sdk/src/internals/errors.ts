import { hasProperty, isObject, isValidJson } from '@metamask/utils';

export const SNAP_ERROR_CODE = -31002;
export const SNAP_ERROR_MESSAGE = 'Snap Error';

/**
 * Get the error message from an unknown error type.
 *
 * - If the error is an object with a `message` property, return the message.
 * - Otherwise, return the error converted to a string.
 *
 * @param error - The error to get the message from.
 * @returns The error message.
 * @internal
 */
export function getErrorMessage(error: unknown) {
  if (
    isObject(error) &&
    hasProperty(error, 'message') &&
    typeof error.message === 'string'
  ) {
    return error.message;
  }

  return String(error);
}

/**
 * Get the error stack from an unknown error type.
 *
 * @param error - The error to get the stack from.
 * @returns The error stack, or undefined if the error does not have a valid
 * stack.
 * @internal
 */
export function getErrorStack(error: unknown) {
  if (
    isObject(error) &&
    hasProperty(error, 'stack') &&
    typeof error.stack === 'string'
  ) {
    return error.stack;
  }

  return undefined;
}

/**
 * Get the error code from an unknown error type.
 *
 * @param error - The error to get the code from.
 * @returns The error code, or `-32603` if the error does not have a valid code.
 * @internal
 */
export function getErrorCode(error: unknown) {
  if (
    isObject(error) &&
    hasProperty(error, 'code') &&
    typeof error.code === 'number' &&
    Number.isInteger(error.code)
  ) {
    return error.code;
  }

  return -32603;
}

/**
 * Get the error data from an unknown error type.
 *
 * @param error - The error to get the data from.
 * @returns The error data, or an empty object if the error does not have valid
 * data.
 * @internal
 */
export function getErrorData(error: unknown) {
  if (
    isObject(error) &&
    hasProperty(error, 'data') &&
    typeof error.data === 'object' &&
    error.data !== null &&
    isValidJson(error.data) &&
    !Array.isArray(error.data)
  ) {
    return error.data;
  }

  return {};
}

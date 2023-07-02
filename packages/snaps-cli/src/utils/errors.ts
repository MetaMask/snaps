import { hasProperty, isObject } from '@metamask/utils';

/**
 * Get the error message from an error.
 *
 * - If the error is an object with a `stack` property, the `stack` property is
 * returned.
 * - If the error is an object with a `message` property, the `message`
 * property is returned.
 * - Otherwise, the error is converted to a string and returned.
 *
 * @param error - The error to get the message from.
 * @returns The error message.
 */
export function getErrorMessage(error: unknown): string {
  if (isObject(error)) {
    if (hasProperty(error, 'stack') && typeof error.stack === 'string') {
      return error.stack;
    }

    if (hasProperty(error, 'message') && typeof error.message === 'string') {
      return error.message;
    }
  }

  return String(error);
}

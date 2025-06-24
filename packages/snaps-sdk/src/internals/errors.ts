import { hasProperty, isObject, isValidJson } from '@metamask/utils';

export const SNAP_ERROR_CODE = -31002;
export const SNAP_ERROR_MESSAGE = 'Snap Error';

/**
 * Get a string property from an object, or convert the object to a string
 * if the property does not exist or is not a string.
 *
 * @param object - The object to get the property from.
 * @param property - The property to get from the object.
 * @param fallback - The fallback value to return if the property does not exist
 * or is not a string. Defaults to the string representation of the object.
 * @returns The value of the property if it exists and is a string, or the
 * fallback value if it does not exist or is not a string.
 */
function getObjectStringProperty<Fallback = string>(
  object: unknown,
  property: string,
  fallback: Fallback = String(object) as Fallback,
): string | Fallback {
  if (isObject(object) && hasProperty(object, property)) {
    const value = object[property];
    if (typeof value === 'string') {
      return value;
    }
  }

  return fallback;
}

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
  return getObjectStringProperty(error, 'message');
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
  return getObjectStringProperty(error, 'stack', null);
}

/**
 * Get the error name from an unknown error type.
 *
 * @param error - The error to get the name from.
 * @returns The error name, or `'Error'` if the error does not have a valid
 * name.
 */
export function getErrorName(error: unknown) {
  const fallbackName = error instanceof Error ? error.name : 'Error';
  return getObjectStringProperty(error, 'name', fallbackName);
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

import type { Json } from '@metamask/utils';
import { hasProperty, isObject, isValidJson } from '@metamask/utils';

export const SNAP_ERROR_CODE = -31002;
export const SNAP_ERROR_MESSAGE = 'Snap Error';

/**
 * Get a property from an object, or return a fallback value if the property
 * does not exist.
 *
 * @param object - The object to get the property from.
 * @param property - The property to get from the object.
 * @param fallback - The fallback value to return if the property does not
 * exist.
 * @returns The value of the property if it exists, or the fallback value if
 * the property does not exist.
 */
function getObjectProperty<Fallback = null>(
  object: unknown,
  property: string,
  fallback: Fallback = null as Fallback,
): unknown {
  if (isObject(object) && hasProperty(object, property)) {
    return object[property];
  }

  return fallback;
}

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
  const value = getObjectProperty(object, property);
  if (typeof value === 'string') {
    return value;
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
  const value = getObjectProperty(error, 'code');
  if (typeof value === 'number') {
    return value;
  }

  return -32603;
}

/**
 * Get the error cause from an unknown error type.
 *
 * @param error - The error to get the cause from.
 * @returns The error cause, or `null` if the error does not have a valid
 * cause.
 */
export function getErrorCause(error: unknown) {
  return getObjectProperty(error, 'cause');
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
  const value = getObjectProperty(error, 'data');
  if (value !== null && isValidJson(value) && !Array.isArray(value)) {
    return value as Record<string, Json>;
  }

  return {};
}

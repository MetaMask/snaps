import { serializeCause } from '@metamask/rpc-errors';
import type { Json, JsonRpcError } from '@metamask/utils';
import {
  hasProperty,
  isJsonRpcError,
  isObject,
  isValidJson,
} from '@metamask/utils';

/**
 * Get the error message from an unknown error type.
 *
 * - If the error is an object with a `message` property, return the message.
 * - Otherwise, return the error converted to a string.
 *
 * @param error - The error to get the message from.
 * @returns The error message.
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
 * @returns The error data, or null if the error does not have valid data.
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

export const SNAP_ERROR_WRAPPER_CODE = -31001;
export const SNAP_ERROR_WRAPPER_MESSAGE = 'Wrapped Snap Error';

export const SNAP_ERROR_CODE = -31002;
export const SNAP_ERROR_MESSAGE = 'Snap Error';

export type SerializedSnapErrorWrapper = {
  code: typeof SNAP_ERROR_WRAPPER_CODE;
  message: typeof SNAP_ERROR_WRAPPER_MESSAGE;
  data: {
    cause: Json;
  };
};

export type SerializedSnapError = {
  code: typeof SNAP_ERROR_CODE;
  message: typeof SNAP_ERROR_MESSAGE;
  data: {
    cause: JsonRpcError & {
      data: Record<string, Json>;
    };
  };
};

export class UnhandledSnapError extends Error {
  readonly #error: unknown;

  readonly #message: string;

  readonly #stack?: string;

  /**
   * Create a new `UnhandledSnapError`.
   *
   * @param error - The error to create the `UnhandledSnapError` from.
   */
  constructor(error: unknown) {
    const message = getErrorMessage(error);
    super(message);

    this.#error = error;
    this.#message = message;
    this.#stack = getErrorStack(error);
  }

  /**
   * The error name.
   *
   * @returns The error name.
   */
  get name() {
    return 'UnhandledSnapError';
  }

  /**
   * The error message.
   *
   * @returns The error message.
   */
  get message() {
    return this.#message;
  }

  /**
   * The error stack.
   *
   * @returns The error stack.
   */
  get stack() {
    return this.#stack;
  }

  /**
   * Convert the error to a JSON object.
   *
   * @returns The JSON object.
   */
  toJSON(): SerializedSnapErrorWrapper {
    const cause = isSnapError(this.#error)
      ? this.#error.serialize()
      : serializeCause(this.#error);

    return {
      code: SNAP_ERROR_WRAPPER_CODE,
      message: SNAP_ERROR_WRAPPER_MESSAGE,
      data: {
        cause,
      },
    };
  }

  /**
   * Serialize the error to a JSON object. This is called by
   * `@metamask/rpc-errors` when serializing the error.
   *
   * @returns The JSON object.
   */
  serialize() {
    return this.toJSON();
  }
}

/**
 * A generic error which can be thrown by a Snap, without it causing the Snap to
 * crash.
 */
export class SnapError extends Error {
  readonly #code: number;

  readonly #message: string;

  readonly #data: Record<string, Json>;

  readonly #stack?: string;

  /**
   * Create a new `SnapError`.
   *
   * @param error - The error to create the `SnapError` from. If this is a
   * `string`, it will be used as the error message. If this is an `Error`, its
   * `message` property will be used as the error message. If this is a
   * `JsonRpcError`, its `message` property will be used as the error message
   * and its `code` property will be used as the error code. Otherwise, the
   * error will be converted to a string and used as the error message.
   * @param data - Additional data to include in the error. This will be merged
   * with the error data, if any.
   */
  constructor(
    error: string | Error | JsonRpcError | SerializedSnapError,
    data: Record<string, Json> = {},
  ) {
    const message = getErrorMessage(error);
    super(message);

    if (isJsonRpcError(error) && isSerializedSnapError(error)) {
      this.#message = error.data.cause.message;
      this.#code = error.data.cause.code;
      this.#data = error.data.cause.data;
      this.#stack = error.data.cause.stack;

      return;
    }

    this.#message = message;
    this.#code = getErrorCode(error);
    this.#data = { ...getErrorData(error), ...data };
    this.#stack = super.stack;
  }

  /**
   * The error name.
   *
   * @returns The error name.
   */
  get name() {
    return 'SnapError';
  }

  /**
   * The error code.
   *
   * @returns The error code.
   */
  get code() {
    return this.#code;
  }

  /**
   * The error message.
   *
   * @returns The error message.
   */
  get message() {
    return this.#message;
  }

  /**
   * Additional data for the error.
   *
   * @returns Additional data for the error.
   */
  get data() {
    return this.#data;
  }

  /**
   * The error stack.
   *
   * @returns The error stack.
   */
  get stack() {
    return this.#stack;
  }

  /**
   * Convert the error to a JSON object.
   *
   * @returns The JSON object.
   */
  toJSON(): SerializedSnapError {
    const data = this.stack
      ? {
          ...this.data,
          stack: this.stack,
        }
      : this.data;

    return {
      code: SNAP_ERROR_CODE,
      message: SNAP_ERROR_MESSAGE,
      data: {
        cause: {
          code: this.code,
          message: this.message,
          data,
        },
      },
    };
  }

  /**
   * Serialize the error to a JSON object. This is called by
   * `@metamask/rpc-errors` when serializing the error.
   *
   * @returns The JSON object.
   */
  serialize() {
    return this.toJSON();
  }
}

/**
 * Check if an object is a `SnapError`.
 *
 * @param error - The object to check.
 * @returns Whether the object is a `SnapError`.
 */
export function isSnapError(error: unknown): error is SnapError {
  if (
    isObject(error) &&
    'serialize' in error &&
    typeof error.serialize === 'function'
  ) {
    const serialized = error.serialize();
    return (
      isJsonRpcError(serialized) &&
      serialized.code === SNAP_ERROR_CODE &&
      serialized.message === SNAP_ERROR_MESSAGE
    );
  }

  return false;
}

/**
 * Check if a JSON-RPC error is a `SnapError`.
 *
 * @param error - The object to check.
 * @returns Whether the object is a `SnapError`.
 */
export function isSerializedSnapError(
  error: JsonRpcError,
): error is SerializedSnapError {
  return error.code === SNAP_ERROR_CODE && error.message === SNAP_ERROR_MESSAGE;
}

/**
 * Check if a JSON-RPC error is a `WrappedSnapError`.
 *
 * @param error - The object to check.
 * @returns Whether the object is a `WrappedSnapError`.
 */
export function isSnapErrorWrapper(
  error: JsonRpcError,
): error is SerializedSnapErrorWrapper {
  return (
    error.code === SNAP_ERROR_WRAPPER_CODE &&
    error.message === SNAP_ERROR_WRAPPER_MESSAGE
  );
}

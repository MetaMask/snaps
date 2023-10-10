import type { Json, JsonRpcError } from '@metamask/utils';
import { hasProperty, isObject, isValidJson } from '@metamask/utils';

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

/**
 * A base class for Snap errors. This should be used for errors which are
 * expected to be thrown by a Snap, and which should not cause the Snap to
 * crash.
 */
export abstract class BaseSnapError extends Error {}

/**
 * A generic error which can be thrown by a Snap, without it causing the Snap to
 * crash.
 */
export class SnapError extends BaseSnapError {
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
    error: string | Error | JsonRpcError,
    data: Record<string, Json> = {},
  ) {
    const message = getErrorMessage(error);
    super(message);

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
  toJSON() {
    return {
      code: this.code,
      message: this.message,
      data: {
        ...this.data,
        stack: this.stack,
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

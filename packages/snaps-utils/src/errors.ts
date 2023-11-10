import {
  errorCodes,
  JsonRpcError as RpcError,
  serializeCause,
} from '@metamask/rpc-errors';
import type { DataWithOptionalCause } from '@metamask/rpc-errors';
import type { SerializedSnapError, SnapError } from '@metamask/snaps-sdk';
import {
  getErrorMessage,
  getErrorStack,
  SNAP_ERROR_CODE,
  SNAP_ERROR_MESSAGE,
} from '@metamask/snaps-sdk';
import type { Json, JsonRpcError } from '@metamask/utils';
import { isObject, isJsonRpcError } from '@metamask/utils';

export const SNAP_ERROR_WRAPPER_CODE = -31001;
export const SNAP_ERROR_WRAPPER_MESSAGE = 'Wrapped Snap Error';

export type SerializedSnapErrorWrapper = {
  code: typeof SNAP_ERROR_WRAPPER_CODE;
  message: typeof SNAP_ERROR_WRAPPER_MESSAGE;
  data: {
    cause: Json;
  };
};

export class WrappedSnapError extends Error {
  readonly #error: unknown;

  readonly #message: string;

  readonly #stack?: string;

  /**
   * Create a new `WrappedSnapError`.
   *
   * @param error - The error to create the `WrappedSnapError` from.
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
    return 'WrappedSnapError';
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
    return isJsonRpcError(serialized) && isSerializedSnapError(serialized);
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
export function isWrappedSnapError(
  error: unknown,
): error is SerializedSnapErrorWrapper {
  return (
    isJsonRpcError(error) &&
    error.code === SNAP_ERROR_WRAPPER_CODE &&
    error.message === SNAP_ERROR_WRAPPER_MESSAGE
  );
}

/**
 * Get a JSON-RPC error with the given code, message, stack, and data.
 *
 * @param code - The error code.
 * @param message - The error message.
 * @param stack - The error stack.
 * @param data - Additional data for the error.
 * @returns The JSON-RPC error.
 */
function getJsonRpcError(
  code: number,
  message: string,
  stack?: string,
  data?: Json,
) {
  const error = new RpcError(code, message, data);
  error.stack = stack;

  return error;
}

/**
 * Attempt to unwrap an unknown error to a `JsonRpcError`. This function will
 * try to get the error code, message, and data from the error, and return a
 * `JsonRpcError` with those properties.
 *
 * @param error - The error to unwrap.
 * @returns A tuple containing the unwrapped error and a boolean indicating
 * whether the error was handled.
 */
export function unwrapError(
  error: unknown,
): [error: RpcError<DataWithOptionalCause>, isHandled: boolean] {
  // This logic is a bit complicated, but it's necessary to handle all the
  // different types of errors that can be thrown by a Snap.

  // If the error is a wrapped Snap error, unwrap it.
  if (isWrappedSnapError(error)) {
    // The wrapped error can be a JSON-RPC error, or an unknown error. If it's
    // a JSON-RPC error, we can unwrap it further.
    if (isJsonRpcError(error.data.cause)) {
      // If the JSON-RPC error is a wrapped Snap error, unwrap it further.
      if (isSerializedSnapError(error.data.cause)) {
        const { code, message, stack, data } = error.data.cause.data.cause;
        return [getJsonRpcError(code, message, stack, data), true];
      }

      // Otherwise, we use the original JSON-RPC error.
      const { code, message, stack, data } = error.data.cause;
      return [getJsonRpcError(code, message, stack, data), false];
    }

    // Otherwise, we throw an internal error with the wrapped error as the
    // message.
    return [
      getJsonRpcError(
        errorCodes.rpc.internal,
        getErrorMessage(error.data.cause),
        getErrorStack(error.data.cause),
      ),
      false,
    ];
  }

  // The error can be a non-wrapped JSON-RPC error, in which case we can just
  // re-throw it with the same code, message, and data.
  if (isJsonRpcError(error)) {
    const { code, message, stack, data } = error;
    return [getJsonRpcError(code, message, stack, data), false];
  }

  // If the error is not a wrapped error, we don't know how to handle it, so we
  // throw an internal error with the error as the message.
  return [
    getJsonRpcError(
      errorCodes.rpc.internal,
      getErrorMessage(error),
      getErrorStack(error),
    ),
    false,
  ];
}

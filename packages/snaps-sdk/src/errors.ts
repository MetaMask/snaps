import type { Json, JsonRpcError } from '@metamask/utils';

import {
  getErrorCode,
  getErrorData,
  getErrorMessage,
  SNAP_ERROR_CODE,
  SNAP_ERROR_MESSAGE,
} from './internals';

/**
 * A generic error which can be thrown by a Snap, without it causing the Snap to
 * crash.
 */
export class SnapError extends Error {
  readonly #code: number;

  readonly #message: string;

  readonly #data?: Record<string, Json>;

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

    const mergedData = { ...getErrorData(error), ...data };
    if (Object.keys(mergedData).length > 0) {
      this.#data = mergedData;
    }

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
  // This line is covered, but Jest doesn't pick it up for some reason.
  /* istanbul ignore next */
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
  // This line is covered, but Jest doesn't pick it up for some reason.
  /* istanbul ignore next */
  get stack() {
    return this.#stack;
  }

  /**
   * Convert the error to a JSON object.
   *
   * @returns The JSON object.
   */
  toJSON(): SerializedSnapError {
    return {
      code: SNAP_ERROR_CODE,
      message: SNAP_ERROR_MESSAGE,
      data: {
        cause: {
          code: this.code,
          message: this.message,
          stack: this.stack,
          ...(this.data ? { data: this.data } : {}),
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
 * A serialized {@link SnapError}. It's JSON-serializable, so it can be sent
 * over the RPC. The original error is wrapped in the `cause` property.
 *
 * @property code - The error code. This is always `-31002`.
 * @property message - The error message. This is always `'Snap Error'`.
 * @property data - The error data.
 * @property data.cause - The cause of the error.
 * @property data.cause.code - The error code.
 * @property data.cause.message - The error message.
 * @property data.cause.stack - The error stack.
 * @property data.cause.data - Additional data for the error.
 * @see SnapError
 */
export type SerializedSnapError = {
  code: typeof SNAP_ERROR_CODE;
  message: typeof SNAP_ERROR_MESSAGE;
  data: {
    cause: JsonRpcError;
  };
};

import type { rpcErrors } from '@metamask/rpc-errors';
import type { Json } from '@metamask/utils';

import { SnapError } from '../errors';

export type JsonRpcErrorFunction = typeof rpcErrors.parse;

/**
 * Create a `SnapError` class from an error function from
 * `@metamask/rpc-errors`. This is useful for creating custom error classes
 * which can be thrown by a Snap.
 *
 * The created class will inherit the message, code, and data properties from
 * the error function.
 *
 * @param fn - The error function to create the class from.
 * @returns The created `SnapError` class.
 */
export function createSnapError(fn: JsonRpcErrorFunction) {
  return class SnapJsonRpcError extends SnapError {
    /**
     * Create a new `SnapJsonRpcError` from a message.
     *
     * @param message - The message to create the error from.
     */
    constructor(message?: string);

    /**
     * Create a new `SnapJsonRpcError` from data.
     *
     * @param data - The data to create the error from.
     */
    constructor(data?: Record<string, Json>);

    /**
     * Create a new `SnapJsonRpcError` from a message and data.
     *
     * @param message - The message to create the error from.
     * @param data - The data to create the error from.
     */
    constructor(
      message?: string | Record<string, Json>,
      data?: Record<string, Json>,
    );

    /**
     * Create a new `SnapJsonRpcError` from a message and data.
     *
     * @param message - The message to create the error from.
     * @param data - The data to create the error from.
     */
    constructor(
      message?: string | Record<string, Json>,
      data?: Record<string, Json>,
    ) {
      if (typeof message === 'object') {
        const error = fn();
        super({
          code: error.code,
          message: error.message,
          data: message,
        });

        return;
      }

      const error = fn(message);
      super({
        code: error.code,
        message: error.message,
        data,
      });
    }
  };
}

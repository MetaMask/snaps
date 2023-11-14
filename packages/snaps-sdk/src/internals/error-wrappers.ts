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
    constructor(message?: string, data?: Record<string, Json>) {
      const error = fn(message);

      super({
        code: error.code,
        message: error.message,
        data,
      });
    }
  };
}

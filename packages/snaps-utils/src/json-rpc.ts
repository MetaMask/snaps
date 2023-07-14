import type {
  Json,
  JsonRpcSuccess,
  AssertionErrorConstructor,
} from '@metamask/utils';
import {
  isJsonRpcFailure,
  isJsonRpcSuccess,
  assertStruct,
} from '@metamask/utils';
import type { Infer } from 'superstruct';
import { boolean, object, optional, refine } from 'superstruct';

export const RpcOriginsStruct = refine(
  object({
    dapps: optional(boolean()),
    snaps: optional(boolean()),
  }),
  'RPC origins',
  (value) => {
    if (!Object.values(value).some(Boolean)) {
      throw new Error('Must specify at least one JSON-RPC origin');
    }

    return true;
  },
);

export type RpcOrigins = Infer<typeof RpcOriginsStruct>;

/**
 * Asserts that the given value is a valid {@link RpcOrigins} object.
 *
 * @param value - The value to assert.
 * @param ErrorWrapper - An optional error wrapper to use. Defaults to
 * {@link AssertionError}.
 * @throws If the value is not a valid {@link RpcOrigins} object.
 */
export function assertIsRpcOrigins(
  value: unknown,
  // eslint-disable-next-line @typescript-eslint/naming-convention
  ErrorWrapper?: AssertionErrorConstructor,
): asserts value is RpcOrigins {
  assertStruct(
    value,
    RpcOriginsStruct,
    'Invalid JSON-RPC origins',
    ErrorWrapper,
  );
}

/**
 * Assert that the given value is a successful JSON-RPC response. If the value
 * is not a success response, an error is thrown. If the value is an JSON-RPC
 * error, the error message is included in the thrown error.
 *
 * @param value - The value to check.
 * @throws If the value is not a JSON-RPC success response.
 */
export function assertIsJsonRpcSuccess(
  value: unknown,
): asserts value is JsonRpcSuccess<Json> {
  if (!isJsonRpcSuccess(value)) {
    if (isJsonRpcFailure(value)) {
      throw new Error(`JSON-RPC request failed: ${value.error.message}`);
    }

    throw new Error('Invalid JSON-RPC response.');
  }
}

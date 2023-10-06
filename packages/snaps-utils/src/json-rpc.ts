import { SubjectType } from '@metamask/permission-controller';
import type {
  AssertionErrorConstructor,
  Json,
  JsonRpcSuccess,
} from '@metamask/utils';
import {
  assertStruct,
  isJsonRpcFailure,
  isJsonRpcSuccess,
} from '@metamask/utils';
import type { Infer } from 'superstruct';
import { array, boolean, object, optional, refine, string } from 'superstruct';

export const RpcOriginsStruct = refine(
  object({
    dapps: optional(boolean()),
    snaps: optional(boolean()),
    allowedOrigins: optional(array(string())),
  }),
  'RPC origins',
  (value) => {
    const hasOrigins = Boolean(
      value.snaps === true ||
        value.dapps === true ||
        (value.allowedOrigins && value.allowedOrigins.length > 0),
    );

    if (hasOrigins) {
      return true;
    }

    return 'Must specify at least one JSON-RPC origin.';
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
 * Check if the given origin is allowed by the given JSON-RPC origins object.
 *
 * @param origins - The JSON-RPC origins object.
 * @param subjectType - The type of the origin.
 * @param origin - The origin to check.
 * @returns Whether the origin is allowed.
 */
export function isOriginAllowed(
  origins: RpcOrigins,
  subjectType: SubjectType,
  origin: string,
) {
  // If the origin is in the `allowedOrigins` list, it is allowed.
  if (origins.allowedOrigins?.includes(origin)) {
    return true;
  }

  // If the origin is a website and `dapps` is true, it is allowed.
  if (subjectType === SubjectType.Website && origins.dapps) {
    return true;
  }

  // If the origin is a snap and `snaps` is true, it is allowed.
  return Boolean(subjectType === SubjectType.Snap && origins.snaps);
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

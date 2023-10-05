import { SubjectType } from '@metamask/permission-controller/dist/SubjectMetadataController';
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
import { array, boolean, object, optional, refine, string } from 'superstruct';

import { union } from './structs';

export const AllowedOriginsStruct = object({
  allowedOrigins: array(string()),
});

export const RpcOriginsStruct = refine(
  object({
    dapps: optional(union([boolean(), AllowedOriginsStruct])),
    snaps: optional(union([boolean(), AllowedOriginsStruct])),
  }),
  'RPC origins',
  (value) => {
    if (
      !Object.values(value).some((originType) => {
        if (typeof originType === 'boolean') {
          return originType;
        }

        return originType?.allowedOrigins?.length > 0;
      })
    ) {
      throw new Error('Must specify at least one JSON-RPC origin.');
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
  const allowedOrigins =
    subjectType === SubjectType.Snap ? origins.snaps : origins.dapps;

  // If `allowedOrigins` is true, all origins are allowed.
  if (allowedOrigins === true) {
    return true;
  }

  // If `allowedOrigins` is false or undefined, the origin is not allowed.
  if (!allowedOrigins) {
    return false;
  }

  // Otherwise, check if the origin is in the list of allowed origins.
  return allowedOrigins.allowedOrigins.includes(origin);
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

import { SubjectType } from '@metamask/permission-controller';
import type { Infer } from '@metamask/superstruct';
import {
  array,
  boolean,
  object,
  optional,
  refine,
  string,
} from '@metamask/superstruct';
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

const AllowedOriginsStruct = array(
  refine(string(), 'Allowed origin', (value) => {
    const wildcards = value.split('*').length - 1;
    if (wildcards > 2) {
      return 'No more than two wildcards ("*") are allowed in an origin specifier.';
    }

    return true;
  }),
);

export const RpcOriginsStruct = refine(
  object({
    dapps: optional(boolean()),
    snaps: optional(boolean()),
    allowedOrigins: optional(AllowedOriginsStruct),
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

export const KeyringOriginsStruct = object({
  allowedOrigins: optional(AllowedOriginsStruct),
});

export type KeyringOrigins = Infer<typeof KeyringOriginsStruct>;

/**
 * Assert that the given value is a valid {@link KeyringOrigins} object.
 *
 * @param value - The value to assert.
 * @param ErrorWrapper - An optional error wrapper to use. Defaults to
 * {@link AssertionError}.
 * @throws If the value is not a valid {@link KeyringOrigins} object.
 */
export function assertIsKeyringOrigins(
  value: unknown,
  // eslint-disable-next-line @typescript-eslint/naming-convention
  ErrorWrapper?: AssertionErrorConstructor,
): asserts value is KeyringOrigins {
  assertStruct(
    value,
    KeyringOriginsStruct,
    'Invalid keyring origins',
    ErrorWrapper,
  );
}

/**
 * Create regular expression for matching against an origin while allowing wildcards.
 *
 * The "*" symbol is treated as a wildcard and will match 0 or more characters.
 *
 * @param matcher - The string to create the regular expression with.
 * @returns The regular expression.
 */
function createOriginRegExp(matcher: string) {
  // Escape potential Regex characters
  const escaped = matcher.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&');
  // Support wildcards
  const regex = escaped.replace(/\\\*/gu, '.*');
  return RegExp(`${regex}$`, 'u');
}

/**
 * Check whether an origin is allowed or not using a matcher string.
 *
 * The matcher string may be a specific origin to match or include wildcards.
 * The "*" symbol is treated as a wildcard and will match 0 or more characters.
 * Note: this means that https://*metamask.io matches both https://metamask.io
 * and https://snaps.metamask.io.
 *
 * @param matcher - The matcher string.
 * @param origin - The origin.
 * @returns Whether the origin is allowed.
 */
function checkAllowedOrigin(matcher: string, origin: string) {
  // If the matcher is a single wildcard or identical to the origin we can return true immediately.
  if (matcher === '*' || matcher === origin) {
    return true;
  }

  const regex = createOriginRegExp(matcher);
  return regex.test(origin);
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
  // The MetaMask client is always allowed.
  if (origin === 'metamask') {
    return true;
  }

  // If the origin is in the `allowedOrigins` list, it is allowed.
  if (
    origins.allowedOrigins?.some((matcher) =>
      checkAllowedOrigin(matcher, origin),
    )
  ) {
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

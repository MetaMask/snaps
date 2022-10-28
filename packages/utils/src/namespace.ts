import {
  array,
  Infer,
  is,
  object,
  optional,
  pattern,
  record,
  size,
  string,
  omit,
  assign,
  partial,
  pick,
} from 'superstruct';
import { JsonRpcRequestStruct } from '@metamask/utils';
import { AssertionErrorConstructor, assertStruct } from './assert';

export const CHAIN_ID_REGEX =
  /^(?<namespace>[-a-z0-9]{3,8}):(?<reference>[-a-zA-Z0-9]{1,32})$/u;

export const ACCOUNT_ID_REGEX =
  /^(?<chainId>(?<namespace>[-a-z0-9]{3,8}):(?<reference>[-a-zA-Z0-9]{1,32})):(?<accountAddress>[a-zA-Z0-9]{1,64})$/u;

/**
 * Parse a chain ID string to an object containing the namespace and reference.
 * This validates the chain ID before parsing it.
 *
 * @param chainId - The chain ID to validate and parse.
 * @returns The parsed chain ID.
 */
export function parseChainId(chainId: ChainId): {
  namespace: NamespaceId;
  reference: string;
} {
  const match = CHAIN_ID_REGEX.exec(chainId);
  if (!match?.groups) {
    throw new Error('Invalid chain ID.');
  }

  return {
    namespace: match.groups.namespace,
    reference: match.groups.reference,
  };
}

/**
 * Parse an account ID to an object containing the chain, chain ID and address.
 * This validates the account ID before parsing it.
 *
 * @param accountId - The account ID to validate and parse.
 * @returns The parsed account ID.
 */
export function parseAccountId(accountId: AccountId): {
  chain: { namespace: NamespaceId; reference: string };
  chainId: ChainId;
  address: string;
} {
  const match = ACCOUNT_ID_REGEX.exec(accountId);
  if (!match?.groups) {
    throw new Error('Invalid account ID.');
  }

  return {
    address: match.groups.accountAddress,
    chainId: match.groups.chainId as ChainId,
    chain: {
      namespace: match.groups.namespace,
      reference: match.groups.reference,
    },
  };
}

/**
 * A helper struct for a string with a minimum length of 1 and a maximum length
 * of 40.
 */
export const LimitedString = size(string(), 1, 40);

/**
 * A CAIP-2 chain ID, i.e., a human-readable namespace and reference.
 */
export const ChainIdStruct = pattern(string(), CHAIN_ID_REGEX);
export type ChainId = `${string}:${string}`;

export const AccountIdStruct = pattern(string(), ACCOUNT_ID_REGEX);
export type AccountId = `${ChainId}:${string}`;

export const AccountIdArrayStruct = array(AccountIdStruct);

/**
 * A chain descriptor.
 */
export const ChainStruct = object({
  id: ChainIdStruct,
  name: LimitedString,
});
export type Chain = Infer<typeof ChainStruct>;

export const NamespaceStruct = object({
  /**
   * A list of supported chains in the namespace.
   */
  chains: array(ChainStruct),

  /**
   * A list of supported RPC methods on the namespace, that a DApp can call.
   */
  methods: optional(array(LimitedString)),

  /**
   * A list of supported RPC events on the namespace, that a DApp can listen to.
   */
  events: optional(array(LimitedString)),
});
export type Namespace = Infer<typeof NamespaceStruct>;

export const RequestNamespaceStruct = assign(
  omit(NamespaceStruct, ['chains']),
  object({ chains: array(ChainIdStruct) }),
);
export type RequestNamespace = Infer<typeof RequestNamespaceStruct>;

export const SessionNamespaceStruct = assign(
  RequestNamespaceStruct,
  object({ accounts: array(AccountIdStruct) }),
);
export type SessionNamespace = Infer<typeof SessionNamespaceStruct>;

/**
 * A CAIP-2 namespace, i.e., the first part of a chain ID.
 */
export const NamespaceIdStruct = pattern(string(), /^[-a-z0-9]{3,8}$/u);
export type NamespaceId = Infer<typeof NamespaceIdStruct>;

/**
 * An object mapping CAIP-2 namespaces to their values.
 */
export const NamespacesStruct = record(NamespaceIdStruct, NamespaceStruct);
export type Namespaces = Infer<typeof NamespacesStruct>;

export const SessionStruct = object({
  namespaces: record(NamespaceIdStruct, SessionNamespaceStruct),
});
export type Session = Infer<typeof SessionStruct>;

/**
 * Asserts that the given value is a valid {@link Session}.
 *
 * @param value - The value to assert.
 * @throws If the value is not a valid {@link Session}.
 */
export function assertIsSession(value: unknown): asserts value is Session {
  assertStruct(value, SessionStruct, 'Invalid session');
}

export const ConnectArgumentsStruct = object({
  requiredNamespaces: record(NamespaceIdStruct, RequestNamespaceStruct),
});
export type ConnectArguments = Infer<typeof ConnectArgumentsStruct>;

export const RequestArgumentsStruct = assign(
  partial(pick(JsonRpcRequestStruct, ['id', 'jsonrpc'])),
  omit(JsonRpcRequestStruct, ['id', 'jsonrpc']),
);
export type RequestArguments = Infer<typeof RequestArgumentsStruct>;

export const MultiChainRequestStruct = object({
  chainId: ChainIdStruct,
  request: RequestArgumentsStruct,
});
export type MultiChainRequest = Infer<typeof MultiChainRequestStruct>;

/**
 * Check if the given value is a CAIP-2 namespace ID.
 *
 * @param value - The value to check.
 * @returns Whether the value is a CAIP-2 namespace ID.
 */
export function isNamespaceId(value: unknown): value is NamespaceId {
  return is(value, NamespaceIdStruct);
}

/**
 * Check if the given value is a CAIP-2 chain ID.
 *
 * @param value - The value to check.
 * @returns Whether the value is a CAIP-2 chain ID.
 */
export function isChainId(value: unknown): value is ChainId {
  return is(value, ChainIdStruct);
}

/**
 * Check if the given value is a CAIP-10 account ID.
 *
 * @param value - The value to check.
 * @returns Whether the value is a CAIP-10 account ID.
 */
export function isAccountId(value: unknown): value is AccountId {
  return is(value, AccountIdStruct);
}

/**
 * Check if the given value is an array of CAIP-10 account IDs.
 *
 * @param value - The value to check.
 * @returns Whether the value is an array of CAIP-10 account IDs.
 */
export function isAccountIdArray(value: unknown): value is AccountId[] {
  return is(value, AccountIdArrayStruct);
}

/**
 * Check if the given value is a {@link ConnectArguments} object.
 *
 * @param value - The value to check.
 * @returns Whether the value is a valid {@link ConnectArguments} object.
 */
export function isConnectArguments(value: unknown): value is ConnectArguments {
  return is(value, ConnectArgumentsStruct);
}

/**
 * Assert that the given value is a {@link ConnectArguments} object.
 *
 * @param value - The value to check.
 * @throws If the value is not a valid {@link ConnectArguments} object.
 */
export function assertIsConnectArguments(
  value: unknown,
): asserts value is ConnectArguments {
  assertStruct(value, ConnectArgumentsStruct, 'Invalid connect arguments');
}

/**
 * Check if the given value is a {@link MultiChainRequest} object.
 *
 * @param value - The value to check.
 * @returns Whether the value is a valid {@link MultiChainRequest} object.
 */
export function isMultiChainRequest(
  value: unknown,
): value is MultiChainRequest {
  return is(value, MultiChainRequestStruct);
}

/**
 * Assert that the given value is a {@link MultiChainRequest} object.
 *
 * @param value - The value to check.
 * @throws If the value is not a valid {@link MultiChainRequest} object.
 */
export function assertIsMultiChainRequest(
  value: unknown,
): asserts value is MultiChainRequest {
  assertStruct(value, MultiChainRequestStruct, 'Invalid request arguments');
}

/**
 * Check if a value is a {@link Namespace}.
 *
 * @param value - The value to validate.
 * @returns True if the value is a valid {@link Namespace}.
 */
export function isNamespace(value: unknown): value is Namespace {
  return is(value, NamespaceStruct);
}

/**
 * Check if a value is an object containing {@link Namespace}s.
 *
 * @param value - The value to validate.
 * @returns True if the value is a valid object containing namespaces.
 */
export function isNamespacesObject(value: unknown): value is Namespaces {
  return is(value, NamespacesStruct);
}

/**
 * Assert that the given value is a {@link Namespaces} object.
 *
 * @param value - The value to check.
 * @param ErrorWrapper - The error wrapper to use. Defaults to
 * {@link AssertionError}.
 * @throws If the value is not a valid {@link Namespaces} object.
 */
export function assertIsNamespacesObject(
  value: unknown,
  ErrorWrapper?: AssertionErrorConstructor,
): asserts value is Namespaces {
  assertStruct(
    value,
    NamespacesStruct,
    'Invalid namespaces object',
    ErrorWrapper,
  );
}

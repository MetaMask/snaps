import type { Infer } from 'superstruct';
import {
  array,
  is,
  object,
  optional,
  pattern,
  size,
  string,
} from 'superstruct';

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

/**
 * A CAIP-2 namespace, i.e., the first part of a chain ID.
 */
export const NamespaceIdStruct = pattern(string(), /^[-a-z0-9]{3,8}$/u);
export type NamespaceId = Infer<typeof NamespaceIdStruct>;

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
 * Check if a value is a {@link Namespace}.
 *
 * @param value - The value to validate.
 * @returns True if the value is a valid {@link Namespace}.
 */
export function isNamespace(value: unknown): value is Namespace {
  return is(value, NamespaceStruct);
}

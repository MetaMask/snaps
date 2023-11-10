/**
 * A CAIP-2 chain ID, i.e., a human-readable namespace and reference.
 *
 * @see https://chainagnostic.org/CAIPs/caip-2
 */
export type ChainId = `${string}:${string}`;

/**
 * A CAIP-10 account ID, i.e., a chain ID and an account address.
 *
 * @see https://chainagnostic.org/CAIPs/caip-10
 */
export type AccountId = `${ChainId}:${string}`;

import type { CaipAccountId, CaipChainId } from '@metamask/utils';

export type {
  CaipAccountId,
  CaipAssetType,
  CaipChainId,
  CaipNamespace,
} from '@metamask/utils';

/**
 * A CAIP-2 chain ID, i.e., a human-readable namespace and reference.
 *
 * @see https://chainagnostic.org/CAIPs/caip-2
 * @deprecated Use {@link CaipChainId} instead.
 */
export type ChainId = CaipChainId;

/**
 * A CAIP-10 account ID, i.e., a chain ID and an account address.
 *
 * @see https://chainagnostic.org/CAIPs/caip-10
 * @deprecated Use {@link CaipAccountId} instead.
 */
export type AccountId = CaipAccountId;

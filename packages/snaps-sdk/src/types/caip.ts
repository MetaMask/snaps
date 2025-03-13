import type { Infer } from '@metamask/superstruct';
import { array, refine } from '@metamask/superstruct';
import {
  CaipAccountIdStruct,
  CaipAssetTypeStruct,
  CaipChainIdStruct,
  KnownCaipNamespace,
  parseCaipAccountId,
  parseCaipAssetType,
  parseCaipChainId,
  type CaipAccountId,
  type CaipChainId,
} from '@metamask/utils';

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

/**
 * A stuct representing a list of CAIP-10 account IDs where the account addresses and namespaces are the same.
 */
export const CaipAccountIdsMatchedByAddressAndNamespaceStruct = refine(
  array(CaipAccountIdStruct),
  'Matching Addresses Account ID List',
  (value) => {
    const parsedAccountIds = value.map((accountId) =>
      parseCaipAccountId(accountId),
    );

    if (
      !parsedAccountIds.every(
        ({ address, chain: { namespace } }) =>
          address === parsedAccountIds[0].address &&
          namespace === parsedAccountIds[0].chain.namespace,
      )
    ) {
      return 'All account IDs must have the same address and namespace.';
    }

    return true;
  },
);

/**
 * A list of CAIP-10 account IDs where the account addresses are the same.
 */
export type MatchingAddressesCaipAccountIdList = Infer<
  typeof CaipAccountIdsMatchedByAddressAndNamespaceStruct
>;

/**
 * A struct representing a list of non-EIP-155 CAIP-10 account IDs where the account addresses are the same.
 */
export const NonEip155CaipAccountIdsMatchedByAddressAndNamespaceStruct = refine(
  CaipAccountIdsMatchedByAddressAndNamespaceStruct,
  'Non-EIP-155 Matching Addresses Account ID List',
  (value) => {
    const containsEip155 = value.some((accountId) => {
      const {
        chain: { namespace },
      } = parseCaipAccountId(accountId);

      return namespace === KnownCaipNamespace.Eip155;
    });

    if (containsEip155) {
      return 'All account IDs must have non-EIP-155 namespaces.';
    }
    return true;
  },
);

/**
 * A list of non-EIP-155 CAIP-10 account IDs where the account addresses are the same.
 */
export type NonEip155MatchingAddressesCaipAccountIdList = Infer<
  typeof NonEip155CaipAccountIdsMatchedByAddressAndNamespaceStruct
>;

/**
 * A struct representing a non-EIP-155 chain ID.
 */
export const NonEip155ChainIdStruct = refine(
  CaipChainIdStruct,
  'Non-EIP-155 Chain ID',
  (value) => {
    const { namespace } = parseCaipChainId(value);

    if (namespace === KnownCaipNamespace.Eip155) {
      return 'Chain ID must not be an EIP-155 chain ID.';
    }

    return true;
  },
);

/**
 * A non-EIP-155 chain ID.
 */
export type NonEip155ChainId = Infer<typeof NonEip155ChainIdStruct>;

/**
 * A struct representing a non-EIP-155 asset type.
 */
export const NonEip155AssetTypeStruct = refine(
  CaipAssetTypeStruct,
  'Non-EIP-155 Asset Type',
  (value) => {
    const {
      chain: { namespace },
    } = parseCaipAssetType(value);

    if (namespace === KnownCaipNamespace.Eip155) {
      return 'Asset type must not be an EIP-155 asset type.';
    }

    return true;
  },
);

/**
 * A non-EIP-155 asset type.
 */
export type NonEip155AssetType = Infer<typeof NonEip155AssetTypeStruct>;

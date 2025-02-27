import type { Infer } from '@metamask/superstruct';
import { array, refine } from '@metamask/superstruct';
import {
  CaipAccountIdStruct,
  parseCaipAccountId,
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
export const MatchingAddressesCaipAccountIdListStruct = refine(
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
      return 'All account IDs must have the same address and chain namespace.';
    }

    return true;
  },
);

/**
 * A list of CAIP-10 account IDs where the account addresses are the same.
 */
export type MatchingAddressesCaipAccountIdList = Infer<
  typeof MatchingAddressesCaipAccountIdListStruct
>;

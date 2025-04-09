import type { SnapId } from '@metamask/snaps-sdk';
import type { Json, CaipAccountId, CaipChainId } from '@metamask/utils';
import {
  KnownCaipNamespace,
  parseCaipChainId,
  toCaipAccountId,
} from '@metamask/utils';

/**
 * Copy of the original type from
 * https://github.com/MetaMask/accounts/blob/main/packages/keyring-internal-api/src/types.ts
 */
export type InternalAccount = {
  id: string;
  type: string;
  address: string;
  options: Record<string, Json>;
  methods: string[];
  scopes: CaipChainId[];
  metadata: {
    name: string;
    snap?: { id: SnapId; enabled: boolean; name: string };
  };
};

/**
 * Create a list of CAIP account IDs from an address and a list of scopes.
 *
 * @param address - The address to create the account IDs from.
 * @param scopes - The scopes to create the account IDs from.
 * @returns The list of CAIP account IDs.
 */
export function createAccountList(
  address: string,
  scopes: CaipChainId[],
): CaipAccountId[] {
  return scopes.map((scope) => {
    const { namespace, reference } = parseCaipChainId(scope);
    return toCaipAccountId(namespace, reference, address);
  });
}

/**
 * Create a list of CAIP chain IDs from a list of account scopes and a list of requested chain IDs.
 *
 * @param accountScopes - The account scopes to create the chain ID list from.
 * @param requestedChainIds - The requested chain IDs to filter the account scopes by.
 * @returns The list of CAIP chain IDs.
 */
export function createChainIdList(
  accountScopes: CaipChainId[],
  requestedChainIds?: CaipChainId[],
) {
  // If there are no requested chain IDs, return all account scopes.
  if (!requestedChainIds || requestedChainIds.length === 0) {
    return accountScopes;
  }

  return accountScopes.reduce<CaipChainId[]>((acc, scope) => {
    // If the scope represents all EVM compatible chains, return all requested chain IDs.
    if (scope === 'eip155:0') {
      const targetChainIds = requestedChainIds.filter((chainId) => {
        const { namespace } = parseCaipChainId(chainId);

        return namespace === KnownCaipNamespace.Eip155;
      });

      return [...acc, ...targetChainIds];
    }

    // If the scope is not in the requested chain IDs, skip it.
    if (requestedChainIds.includes(scope)) {
      return [...acc, scope];
    }

    return acc;
  }, []);
}

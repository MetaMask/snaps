import type { SnapId } from '@metamask/snaps-sdk';
import type { Json, CaipAccountId, CaipChainId } from '@metamask/utils';
import { parseCaipChainId, toCaipAccountId } from '@metamask/utils';

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

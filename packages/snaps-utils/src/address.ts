import type { CaipAccountId, CaipChainId } from '@metamask/utils';
import { parseCaipChainId, toCaipAccountId } from '@metamask/utils';

/**
 * Create a list of CAIP account IDs from an address and a list of scopes.
 *
 * @param address - The address to create the account IDs from.
 * @param scopes - The scopes to create the account IDs from.
 * @returns The list of CAIP account IDs.
 */
export function createAddressList(
  address: string,
  scopes: CaipChainId[],
): CaipAccountId[] {
  return scopes.map((scope) => {
    const { namespace, reference } = parseCaipChainId(scope);
    return toCaipAccountId(namespace, reference, address);
  });
}

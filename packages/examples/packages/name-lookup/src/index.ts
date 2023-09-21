import type { OnNameLookupHandler } from '@metamask/snaps-types';

export const onNameLookup: OnNameLookupHandler = async (request) => {
  const { chainId, address, domain } = request;

  if (address) {
    const shortAddress = `0x${address.substring(2, 5)}`;
    const chainIdHex = `0x${parseInt(chainId.split(':')[1], 10).toString(16)}`;
    const resolvedDomain = `Test Token - ${shortAddress} / ${chainIdHex}`;
    return { resolvedDomain };
  }

  if (domain) {
    const resolvedAddress = `0xc0ffee254729296a45a3885639AC7E10F9d54979`;
    return { resolvedAddress };
  }

  return null;
};

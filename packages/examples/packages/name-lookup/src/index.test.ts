import { describe, it } from '@jest/globals';
import type { ChainId } from '@metamask/snaps-sdk';

import { onNameLookup } from '.';

const DOMAIN_MOCK = 'test.domain';
const ADDRESS_MOCK = '0xc0ffee254729296a45a3885639AC7E10F9d54979';
const CHAIN_ID_MOCK = 'eip155:1' as ChainId;

describe('onNameLookup', () => {
  it('returns resolved address if domain', async () => {
    const request = {
      domain: DOMAIN_MOCK,
      chainId: CHAIN_ID_MOCK,
    };

    expect(await onNameLookup(request)).toStrictEqual({
      resolvedAddresses: [
        {
          resolvedAddress: '0xc0ffee254729296a45a3885639AC7E10F9d54979',
          protocol: 'test protocol',
          domainName: DOMAIN_MOCK,
        },
      ],
    });
  });

  it('returns resolved domain if address', async () => {
    const request = {
      address: ADDRESS_MOCK,
      chainId: CHAIN_ID_MOCK,
    };

    expect(await onNameLookup(request)).toStrictEqual({
      resolvedDomains: [
        { resolvedDomain: 'c0f.1.test.domain', protocol: 'test protocol' },
      ],
    });
  });

  it('returns resolved domain if address and domain', async () => {
    const request = {
      address: ADDRESS_MOCK,
      domain: DOMAIN_MOCK,
      chainId: CHAIN_ID_MOCK,
    } as any;

    expect(await onNameLookup(request)).toStrictEqual({
      resolvedDomains: [
        { resolvedDomain: 'c0f.1.test.domain', protocol: 'test protocol' },
      ],
    });
  });

  it('returns null if no domain or address', async () => {
    const request = {
      chainId: CHAIN_ID_MOCK,
    };

    // @ts-expect-error - Testing invalid request.
    expect(await onNameLookup(request)).toBeNull();
  });
});

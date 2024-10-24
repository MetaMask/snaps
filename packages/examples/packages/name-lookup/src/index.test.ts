import { describe, expect, it } from '@jest/globals';
import { installSnap } from '@metamask/snaps-jest';
import type { ChainId } from '@metamask/snaps-sdk';

const DOMAIN_MOCK = 'test.domain';
const ADDRESS_MOCK = '0xc0ffee254729296a45a3885639AC7E10F9d54979';
const CHAIN_ID_MOCK = 'eip155:1' as ChainId;

describe('onNameLookup', () => {
  it('returns resolved address if domain', async () => {
    const request = {
      domain: DOMAIN_MOCK,
      chainId: CHAIN_ID_MOCK,
    };

    const { onNameLookup } = await installSnap();
    const response = await onNameLookup(request);

    expect(response).toRespondWith({
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

    const { onNameLookup } = await installSnap();

    expect(await onNameLookup(request)).toRespondWith({
      resolvedDomains: [
        { resolvedDomain: 'c0f.1.test.domain', protocol: 'test protocol' },
      ],
    });
  });
});

import { findMatchingKeyringSnaps } from './keyring';

describe('findMatchingKeyringSnaps', () => {
  it('finds matching keyring snaps', () => {
    const requestedNamespaces = {
      eip155: {
        methods: [
          'eth_signTransaction',
          'eth_accounts',
          'eth_sign',
          'personal_sign',
          'eth_signTypedData',
        ],
        events: ['accountsChanged'],
        chains: [
          {
            id: 'eip155:1',
            name: 'Ethereum (Mainnet)',
          },
        ],
      },
      bip122: {
        methods: ['signPBST', 'getExtendedPublicKey'],
        chains: [
          {
            id: 'bip122:000000000019d6689c085ae165831e93',
            name: 'Bitcoin (Mainnet)',
          },
          {
            id: 'bip122:000000000933ea01ad0ee984209779ba',
            name: 'Bitcoin (Testnet)',
          },
        ],
      },
    };

    const snaps = { foo: requestedNamespaces };

    expect(findMatchingKeyringSnaps(requestedNamespaces, snaps)).toStrictEqual({
      bip122: 'foo',
      eip155: 'foo',
    });
  });

  it('doesnt match namespaces that dont support all events', () => {
    const requestedNamespaces = {
      eip155: {
        methods: [
          'eth_signTransaction',
          'eth_accounts',
          'eth_sign',
          'personal_sign',
          'eth_signTypedData',
        ],
        events: ['accountsChanged'],
        chains: [
          {
            id: 'eip155:1',
            name: 'Ethereum (Mainnet)',
          },
        ],
      },
    };

    const snaps = {
      foo: { eip155: { ...requestedNamespaces.eip155, events: [] } },
    };

    expect(findMatchingKeyringSnaps(requestedNamespaces, snaps)).toStrictEqual({
      eip155: null,
    });
  });

  it('doesnt match namespaces that dont support all methods', () => {
    const requestedNamespaces = {
      eip155: {
        methods: [
          'eth_signTransaction',
          'eth_accounts',
          'eth_sign',
          'personal_sign',
          'eth_signTypedData',
        ],
        events: ['accountsChanged'],
        chains: [
          {
            id: 'eip155:1',
            name: 'Ethereum (Mainnet)',
          },
        ],
      },
    };

    const snaps = {
      foo: { eip155: { ...requestedNamespaces.eip155, methods: [] } },
    };

    expect(findMatchingKeyringSnaps(requestedNamespaces, snaps)).toStrictEqual({
      eip155: null,
    });
  });
});

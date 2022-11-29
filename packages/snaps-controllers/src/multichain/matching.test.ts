import { MOCK_EIP155_NAMESPACE, MOCK_NAMESPACES } from '../test-utils';
import { findMatchingKeyringSnaps } from './matching';

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
        chains: ['eip155:1'],
      },
      bip122: {
        methods: ['signPBST', 'getExtendedPublicKey'],
        chains: [
          'bip122:000000000019d6689c085ae165831e93',
          'bip122:000000000933ea01ad0ee984209779ba',
        ],
      },
    };

    const exposedNamespaces = MOCK_NAMESPACES;

    const snaps = {
      foo: exposedNamespaces,
      bar: { bip122: exposedNamespaces.bip122 },
    };

    expect(findMatchingKeyringSnaps(requestedNamespaces, snaps)).toStrictEqual({
      bip122: ['foo', 'bar'],
      eip155: ['foo'],
    });
  });

  it('allows omitting of methods', () => {
    const requestedNamespaces = {
      eip155: {
        events: ['accountsChanged'],
        chains: ['eip155:1'],
      },
    };

    const exposedNamespaces = {
      eip155: {
        ...MOCK_EIP155_NAMESPACE,
        methods: undefined,
      },
    };

    const snaps = {
      foo: exposedNamespaces,
    };

    expect(findMatchingKeyringSnaps(requestedNamespaces, snaps)).toStrictEqual({
      eip155: ['foo'],
    });
  });

  it('doesnt match namespaces that are null', () => {
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
        chains: ['eip155:1', 'eip155:966'],
      },
    };

    const snaps = {
      foo: null,
    };

    expect(findMatchingKeyringSnaps(requestedNamespaces, snaps)).toStrictEqual({
      eip155: [],
    });
  });

  it('doesnt match namespaces that dont support all chains', () => {
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
        chains: ['eip155:1', 'eip155:966'],
      },
    };

    const exposedNamespaces = {
      eip155: MOCK_EIP155_NAMESPACE,
    };

    const snaps = {
      foo: exposedNamespaces,
    };

    expect(findMatchingKeyringSnaps(requestedNamespaces, snaps)).toStrictEqual({
      eip155: [],
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
        chains: ['eip155:1'],
      },
    };

    const exposedNamespaces = {
      eip155: {
        ...MOCK_EIP155_NAMESPACE,
        events: [],
      },
    };

    const snaps = {
      foo: exposedNamespaces,
    };

    expect(findMatchingKeyringSnaps(requestedNamespaces, snaps)).toStrictEqual({
      eip155: [],
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
        chains: ['eip155:1'],
      },
    };

    const exposedNamespaces = {
      eip155: {
        methods: [],
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
      foo: exposedNamespaces,
    };

    expect(findMatchingKeyringSnaps(requestedNamespaces, snaps)).toStrictEqual({
      eip155: [],
    });
  });
});

import {
  getChain,
  getNamespace,
  getSessionNamespace,
  getRequestNamespace,
} from './test-utils';
import {
  assertIsConnectArguments,
  assertIsMultiChainRequest,
  assertIsNamespacesObject,
  assertIsSession,
  isAccountId,
  isAccountIdArray,
  isChainId,
  isConnectArguments,
  isMultiChainRequest,
  isNamespace,
  isNamespaceId,
  isNamespacesObject,
  parseAccountId,
  parseChainId,
} from './namespace';

describe('parseChainId', () => {
  it('parses valid chain ids', () => {
    expect(parseChainId('eip155:1')).toMatchInlineSnapshot(`
      {
        "namespace": "eip155",
        "reference": "1",
      }
    `);

    expect(
      parseChainId('bip122:000000000019d6689c085ae165831e93'),
    ).toMatchInlineSnapshot(
      `
      {
        "namespace": "bip122",
        "reference": "000000000019d6689c085ae165831e93",
      }
    `,
    );

    expect(parseChainId('cosmos:cosmoshub-3')).toMatchInlineSnapshot(
      `
      {
        "namespace": "cosmos",
        "reference": "cosmoshub-3",
      }
    `,
    );

    expect(
      parseChainId('polkadot:b0a8d493285c2df73290dfb7e61f870f'),
    ).toMatchInlineSnapshot(
      `
      {
        "namespace": "polkadot",
        "reference": "b0a8d493285c2df73290dfb7e61f870f",
      }
    `,
    );
  });

  it.each([
    true,
    false,
    null,
    undefined,
    1,
    'foo',
    'foobarbazquz:1',
    'foo:',
    'foo:foobarbazquzfoobarbazquzfoobarbazquzfoobarbazquzfoobarbazquzfoobarbazquz',
  ])('throws for invalid input', (input) => {
    expect(() => parseChainId(input as any)).toThrow('Invalid chain ID.');
  });
});

describe('parseAccountId', () => {
  it('parses valid account ids', () => {
    expect(
      parseAccountId('eip155:1:0xab16a96d359ec26a11e2c2b3d8f8b8942d5bfcdb'),
    ).toMatchInlineSnapshot(
      `
      {
        "address": "0xab16a96d359ec26a11e2c2b3d8f8b8942d5bfcdb",
        "chain": {
          "namespace": "eip155",
          "reference": "1",
        },
        "chainId": "eip155:1",
      }
    `,
    );

    expect(
      parseAccountId(
        'bip122:000000000019d6689c085ae165831e93:128Lkh3S7CkDTBZ8W7BbpsN3YYizJMp8p6',
      ),
    ).toMatchInlineSnapshot(
      `
      {
        "address": "128Lkh3S7CkDTBZ8W7BbpsN3YYizJMp8p6",
        "chain": {
          "namespace": "bip122",
          "reference": "000000000019d6689c085ae165831e93",
        },
        "chainId": "bip122:000000000019d6689c085ae165831e93",
      }
    `,
    );

    expect(
      parseAccountId(
        'cosmos:cosmoshub-3:cosmos1t2uflqwqe0fsj0shcfkrvpukewcw40yjj6hdc0',
      ),
    ).toMatchInlineSnapshot(
      `
      {
        "address": "cosmos1t2uflqwqe0fsj0shcfkrvpukewcw40yjj6hdc0",
        "chain": {
          "namespace": "cosmos",
          "reference": "cosmoshub-3",
        },
        "chainId": "cosmos:cosmoshub-3",
      }
    `,
    );

    expect(
      parseAccountId(
        'polkadot:b0a8d493285c2df73290dfb7e61f870f:5hmuyxw9xdgbpptgypokw4thfyoe3ryenebr381z9iaegmfy',
      ),
    ).toMatchInlineSnapshot(
      `
      {
        "address": "5hmuyxw9xdgbpptgypokw4thfyoe3ryenebr381z9iaegmfy",
        "chain": {
          "namespace": "polkadot",
          "reference": "b0a8d493285c2df73290dfb7e61f870f",
        },
        "chainId": "polkadot:b0a8d493285c2df73290dfb7e61f870f",
      }
    `,
    );
  });

  it.each([
    true,
    false,
    null,
    undefined,
    1,
    'foo',
    'foobarbazquz:1',
    'foo:',
    'foo:foobarbazquzfoobarbazquzfoobarbazquzfoobarbazquzfoobarbazquzfoobarbazquz',
    'eip155:1',
    'eip155:1:',
  ])('throws for invalid input', (input) => {
    expect(() => parseAccountId(input as any)).toThrow('Invalid account ID.');
  });
});

describe('assertIsSession', () => {
  it.each([
    {
      namespaces: {},
    },
    {
      namespaces: {
        eip155: getSessionNamespace(),
        bip122: getSessionNamespace(),
      },
    },
    {
      namespaces: {
        eip155: getSessionNamespace(),
      },
    },
    {
      namespaces: {
        bip122: getSessionNamespace(),
      },
    },
  ])('does not throw for a valid session', (session) => {
    expect(() => assertIsSession(session)).not.toThrow();
  });

  it.each([
    true,
    false,
    null,
    undefined,
    1,
    'foo',
    {},
    { namespaces: true },
    { namespaces: false },
    { namespaces: null },
    { namespaces: undefined },
    { namespaces: 1 },
    { namespaces: 'foo' },
    { namespaces: { eip155: {} } },
    { namespaces: { eip155: [], bip122: [] } },
    { namespaces: { eip155: true, bip122: true } },
    { namespaces: { eip155: false, bip122: false } },
    { namespaces: { eip155: null, bip122: null } },
    { namespaces: { eip155: undefined, bip122: undefined } },
    { namespaces: { eip155: 1, bip122: 1 } },
    { namespaces: { eip155: 'foo', bip122: 'foo' } },
    { namespaces: { eip155: { methods: [] }, bip122: { methods: [] } } },
    {
      namespaces: { eip155: { chains: ['foo'] }, bip122: { chains: ['foo'] } },
    },
    { namespaces: { a: getNamespace() } },
    { namespaces: { eip155: getNamespace(), a: getNamespace() } },
    { namespaces: { foobarbaz: getNamespace() } },
  ])('throws for an invalid session', (session) => {
    expect(() => assertIsSession(session)).toThrow('Invalid session');
  });
});

describe('isNamespaceId', () => {
  it.each(['eip155', 'bip122'])(
    'returns true for a valid namespace id',
    (id) => {
      expect(isNamespaceId(id)).toBe(true);
    },
  );

  it.each([true, false, null, undefined, 1, {}, [], 'a', 'foobarbaz'])(
    'returns false for an invalid namespace id',
    (id) => {
      expect(isNamespaceId(id)).toBe(false);
    },
  );
});

describe('isChainId', () => {
  it.each([
    'eip155:1',
    'eip155:1337',
    'bip122:000000000019d6689c085ae165831e93',
  ])('returns true for a valid chain id', (id) => {
    expect(isChainId(id)).toBe(true);
  });

  it.each([
    true,
    false,
    null,
    undefined,
    1,
    {},
    [],
    'a',
    'eip155',
    'eip155:',
    'eip155:1:2',
    'bip122',
    'bip122:',
    'bip122:000000000019d6689c085ae165831e93:2',
  ])('returns false for an invalid chain id', (id) => {
    expect(isChainId(id)).toBe(false);
  });
});

describe('isAccountId', () => {
  it.each([
    'eip155:1:0x0000000000000000000000000000000000000000',
    'eip155:1337:0x0000000000000000000000000000000000000000',
    'bip122:000000000019d6689c085ae165831e93:0x0000000000000000000000000000000000000000',
  ])('returns true for a valid account id', (id) => {
    expect(isAccountId(id)).toBe(true);
  });

  it.each([
    true,
    false,
    null,
    undefined,
    1,
    {},
    [],
    'foo',
    'eip155',
    'eip155:',
    'eip155:1',
    'eip155:1:',
    'eip155:1:0x0000000000000000000000000000000000000000:2',
    'bip122',
    'bip122:',
    'bip122:000000000019d6689c085ae165831e93',
    'bip122:000000000019d6689c085ae165831e93:',
    'bip122:000000000019d6689c085ae165831e93:0x0000000000000000000000000000000000000000:2',
  ])('returns false for an invalid account id', (id) => {
    expect(isAccountId(id)).toBe(false);
  });
});

describe('isAccountIdArray', () => {
  it.each([
    // `it.each` does not support nested arrays, so we nest them in objects.
    {
      accounts: [],
    },
    {
      accounts: [
        'eip155:1:0x0000000000000000000000000000000000000000',
        'eip155:1337:0x0000000000000000000000000000000000000000',
        'bip122:000000000019d6689c085ae165831e93:0x0000000000000000000000000000000000000000',
      ],
    },
    {
      accounts: ['eip155:1:0x0000000000000000000000000000000000000000'],
    },
  ])('returns true for a valid account id array', ({ accounts }) => {
    expect(isAccountIdArray(accounts)).toBe(true);
  });

  it.each([
    true,
    false,
    null,
    undefined,
    1,
    {},
    'foo',
    ['foo'],
    ['eip155:1:0x0000000000000000000000000000000000000000:2'],
    [
      'bip122:000000000019d6689c085ae165831e93:0x0000000000000000000000000000000000000000:2',
    ],
  ])('returns false for an invalid account id array', (accounts) => {
    expect(isAccountIdArray(accounts)).toBe(false);
  });
});

describe('isConnectArguments', () => {
  it.each([
    {
      requiredNamespaces: {
        eip155: getRequestNamespace(),
      },
    },
    {
      requiredNamespaces: {
        bip122: getRequestNamespace(),
      },
    },
    {
      requiredNamespaces: {
        eip155: getRequestNamespace(),
        bip122: getRequestNamespace(),
      },
    },
  ])('returns true for a valid connect arguments object', (args) => {
    expect(isConnectArguments(args)).toBe(true);
  });

  it.each([
    true,
    false,
    null,
    undefined,
    1,
    'foo',
    {},
    { requiredNamespaces: true },
    { requiredNamespaces: false },
    { requiredNamespaces: null },
    { requiredNamespaces: undefined },
    { requiredNamespaces: 1 },
    { requiredNamespaces: 'foo' },
    { requiredNamespaces: { eip155: {} } },
    { requiredNamespaces: { eip155: [], bip122: [] } },
    { requiredNamespaces: { eip155: true, bip122: true } },
    { requiredNamespaces: { eip155: false, bip122: false } },
    { requiredNamespaces: { eip155: null, bip122: null } },
    { requiredNamespaces: { eip155: undefined, bip122: undefined } },
    { requiredNamespaces: { eip155: 1, bip122: 1 } },
    { requiredNamespaces: { eip155: 'foo', bip122: 'foo' } },
    {
      requiredNamespaces: { eip155: { methods: [] }, bip122: { methods: [] } },
    },
    {
      requiredNamespaces: {
        eip155: { chains: ['foo'] },
        bip122: { chains: ['foo'] },
      },
    },
    { requiredNamespaces: { a: getRequestNamespace() } },
    {
      requiredNamespaces: {
        eip155: getRequestNamespace(),
        a: getRequestNamespace(),
      },
    },
    { requiredNamespaces: { foobarbaz: getRequestNamespace() } },
  ])('returns false for an invalid connect arguments object', (args) => {
    expect(isConnectArguments(args)).toBe(false);
  });
});

describe('assertIsConnectArguments', () => {
  it.each([
    {
      requiredNamespaces: {
        eip155: getRequestNamespace(),
      },
    },
    {
      requiredNamespaces: {
        bip122: getRequestNamespace(),
      },
    },
    {
      requiredNamespaces: {
        eip155: getRequestNamespace(),
        bip122: getRequestNamespace(),
      },
    },
  ])('does not throw for a valid connect arguments object', (args) => {
    expect(() => assertIsConnectArguments(args)).not.toThrow();
  });

  it.each([
    true,
    false,
    null,
    undefined,
    1,
    'foo',
    {},
    { requiredNamespaces: true },
    { requiredNamespaces: false },
    { requiredNamespaces: null },
    { requiredNamespaces: undefined },
    { requiredNamespaces: 1 },
    { requiredNamespaces: 'foo' },
    { requiredNamespaces: { eip155: {} } },
    { requiredNamespaces: { eip155: [], bip122: [] } },
    { requiredNamespaces: { eip155: true, bip122: true } },
    { requiredNamespaces: { eip155: false, bip122: false } },
    { requiredNamespaces: { eip155: null, bip122: null } },
    { requiredNamespaces: { eip155: undefined, bip122: undefined } },
    { requiredNamespaces: { eip155: 1, bip122: 1 } },
    { requiredNamespaces: { eip155: 'foo', bip122: 'foo' } },
    {
      requiredNamespaces: { eip155: { methods: [] }, bip122: { methods: [] } },
    },
    {
      requiredNamespaces: {
        eip155: { chains: ['foo'] },
        bip122: { chains: ['foo'] },
      },
    },
    { requiredNamespaces: { a: getRequestNamespace() } },
    {
      requiredNamespaces: {
        eip155: getRequestNamespace(),
        a: getRequestNamespace(),
      },
    },
    { requiredNamespaces: { foobarbaz: getRequestNamespace() } },
  ])('throws for an invalid connect arguments object', (args) => {
    expect(() => assertIsConnectArguments(args)).toThrow(
      'Invalid connect arguments',
    );
  });
});

describe('isMultiChainRequest', () => {
  it.each([
    {
      chainId: 'eip155:1',
      request: {
        method: 'eth_getBalance',
        params: ['0x0000000000000000000000000000000000000000', 'latest'],
      },
    },
    {
      chainId: 'bip122:000000000019d6689c085ae165831e93',
      request: {
        method: 'eth_getBalance',
        params: ['0x0000000000000000000000000000000000000000', 'latest'],
      },
    },
  ])('returns true for a valid multichain request', (request) => {
    expect(isMultiChainRequest(request)).toBe(true);
  });

  it.each([
    true,
    false,
    null,
    undefined,
    1,
    'foo',
    {},
    { chainId: true },
    { chainId: false },
    { chainId: null },
    { chainId: undefined },
    { chainId: 1 },
    { chainId: 'foo' },
    { chainId: 'eip155:1', request: true },
    { chainId: 'eip155:1', request: false },
    { chainId: 'eip155:1', request: null },
    { chainId: 'eip155:1', request: undefined },
    { chainId: 'eip155:1', request: 1 },
    { chainId: 'eip155:1', request: 'foo' },
    { chainId: 'eip155:1', request: {} },
    { chainId: 'eip155:1', request: { method: true } },
    { chainId: 'eip155:1', request: { method: false } },
    { chainId: 'eip155:1', request: { method: null } },
    { chainId: 'eip155:1', request: { method: undefined } },
    { chainId: 'eip155:1', request: { method: 1 } },
    { chainId: 'eip155:1', request: { method: {} } },
    { chainId: 'eip155:1', request: { method: 'foo', params: true } },
    { chainId: 'eip155:1', request: { method: 'foo', params: false } },
    { chainId: 'eip155:1', request: { method: 'foo', params: null } },
    { chainId: 'eip155:1', request: { method: 'foo', params: 1 } },
    { chainId: 'eip155:1', request: { method: 'foo', params: 'foo' } },
  ])('returns false for an invalid multichain request', (request) => {
    expect(isMultiChainRequest(request)).toBe(false);
  });
});

describe('assertIsMultiChainRequest', () => {
  it.each([
    {
      chainId: 'eip155:1',
      request: {
        method: 'eth_getBalance',
        params: ['0x0000000000000000000000000000000000000000', 'latest'],
      },
    },
    {
      chainId: 'bip122:000000000019d6689c085ae165831e93',
      request: {
        method: 'eth_getBalance',
        params: ['0x0000000000000000000000000000000000000000', 'latest'],
      },
    },
  ])('does not throw for a valid multichain request', (request) => {
    expect(() => assertIsMultiChainRequest(request)).not.toThrow();
  });

  it.each([
    true,
    false,
    null,
    undefined,
    1,
    'foo',
    {},
    { chainId: true },
    { chainId: false },
    { chainId: null },
    { chainId: undefined },
    { chainId: 1 },
    { chainId: 'foo' },
    { chainId: 'eip155:1', request: true },
    { chainId: 'eip155:1', request: false },
    { chainId: 'eip155:1', request: null },
    { chainId: 'eip155:1', request: undefined },
    { chainId: 'eip155:1', request: 1 },
    { chainId: 'eip155:1', request: 'foo' },
    { chainId: 'eip155:1', request: {} },
    { chainId: 'eip155:1', request: { method: true } },
    { chainId: 'eip155:1', request: { method: false } },
    { chainId: 'eip155:1', request: { method: null } },
    { chainId: 'eip155:1', request: { method: undefined } },
    { chainId: 'eip155:1', request: { method: 1 } },
    { chainId: 'eip155:1', request: { method: {} } },
    { chainId: 'eip155:1', request: { method: 'foo', params: true } },
    { chainId: 'eip155:1', request: { method: 'foo', params: false } },
    { chainId: 'eip155:1', request: { method: 'foo', params: null } },
    { chainId: 'eip155:1', request: { method: 'foo', params: 1 } },
    { chainId: 'eip155:1', request: { method: 'foo', params: 'foo' } },
  ])('throws for an invalid multichain request', (request) => {
    expect(() => assertIsMultiChainRequest(request)).toThrow('Invalid request');
  });
});

describe('isNamespace', () => {
  it.each([
    getNamespace(),
    { chains: [getChain()], methods: ['eth_signTransaction'] },
    { chains: [getChain()], events: ['accountsChanged'] },
    { chains: [getChain()] },
  ])('returns true for a valid namespace', (namespace) => {
    expect(isNamespace(namespace)).toBe(true);
  });

  it.each([
    {},
    [],
    true,
    false,
    null,
    undefined,
    1,
    'foo',
    { methods: [], events: [] },
    { chains: ['foo'] },
  ])('returns false for an invalid namespace', (namespace) => {
    expect(isNamespace(namespace)).toBe(false);
  });
});

describe('isNamespacesObject', () => {
  it.each([
    {},
    { eip155: getNamespace() },
    { bip122: getNamespace() },
    { eip155: getNamespace(), bip122: getNamespace() },
  ])('returns true for a valid namespaces object', (object) => {
    expect(isNamespacesObject(object)).toBe(true);
  });

  it.each([
    true,
    false,
    null,
    undefined,
    1,
    'foo',
    { eip155: {} },
    { eip155: [], bip122: [] },
    { eip155: true, bip122: true },
    { eip155: false, bip122: false },
    { eip155: null, bip122: null },
    { eip155: undefined, bip122: undefined },
    { eip155: 1, bip122: 1 },
    { eip155: 'foo', bip122: 'foo' },
    { eip155: { methods: [] }, bip122: { methods: [] } },
    { eip155: { chains: ['foo'] }, bip122: { chains: ['foo'] } },
    { a: getNamespace() },
    { eip155: getNamespace(), a: getNamespace() },
    { foobarbaz: getNamespace() },
  ])('returns false for an invalid namespaces object', (object) => {
    expect(isNamespacesObject(object)).toBe(false);
  });
});

describe('assertIsNamespacesObject', () => {
  it.each([
    {},
    { eip155: getNamespace() },
    { bip122: getNamespace() },
    { eip155: getNamespace(), bip122: getNamespace() },
  ])('does not throw for a valid namespaces object', (object) => {
    expect(() => assertIsNamespacesObject(object)).not.toThrow();
  });

  it.each([
    true,
    false,
    null,
    undefined,
    1,
    'foo',
    { eip155: {} },
    { eip155: [], bip122: [] },
    { eip155: true, bip122: true },
    { eip155: false, bip122: false },
    { eip155: null, bip122: null },
    { eip155: undefined, bip122: undefined },
    { eip155: 1, bip122: 1 },
    { eip155: 'foo', bip122: 'foo' },
    { eip155: { methods: [] }, bip122: { methods: [] } },
    { eip155: { chains: ['foo'] }, bip122: { chains: ['foo'] } },
    { a: getNamespace() },
    { eip155: getNamespace(), a: getNamespace() },
    { foobarbaz: getNamespace() },
  ])('throws for an invalid namespaces object', (object) => {
    expect(() => assertIsNamespacesObject(object)).toThrow(
      'Invalid namespaces object:',
    );
  });
});

import { getChain, getNamespace, getSessionNamespace } from './test-utils';
import {
  assertIsSession,
  isNamespace,
  isNamespacesObject,
  parseAccountId,
  parseChainId,
} from './namespace';

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

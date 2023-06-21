import {
  isAccountId,
  isAccountIdArray,
  isChainId,
  isNamespace,
  isNamespaceId,
  parseAccountId,
  parseChainId,
} from './namespace';
import { getChain, getNamespace } from './test-utils';

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

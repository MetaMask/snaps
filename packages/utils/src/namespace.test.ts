import { getChain, getNamespace, getSessionNamespace } from './test-utils';
import { assertIsSession, isNamespace, isNamespacesObject } from './namespace';

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

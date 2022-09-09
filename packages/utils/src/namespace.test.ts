import { getChain, getNamespace } from './__test__';
import { isNamespace, isNamespacesObject } from './namespace';

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

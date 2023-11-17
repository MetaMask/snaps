import { expectTypeOf } from 'expect-type';

import type { SnapsEthereumProvider, SnapsProvider } from './provider';

describe('SnapsEthereumProvider', () => {
  it('only has the expected methods', () => {
    expectTypeOf<SnapsEthereumProvider>().toHaveProperty('request');
    expectTypeOf<SnapsEthereumProvider>().toHaveProperty('on');
    expectTypeOf<SnapsEthereumProvider>().toHaveProperty('removeListener');
    expectTypeOf<SnapsEthereumProvider>().not.toHaveProperty('isConnected');
  });
});

describe('SnapsProvider', () => {
  it('has a request method', () => {
    expectTypeOf<SnapsProvider>().toHaveProperty('request');
  });
});

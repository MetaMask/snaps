import { expectTypeOf } from 'expect-type';

import type {
  Bip32Entropy,
  Bip44Entropy,
  Cronjob,
  InitialPermissions,
  RequestedSnap,
} from './permissions';

describe('Cronjob', () => {
  it('has an expression and JSON-RPC request', () => {
    const cronjob = {
      expression: '* * * * *',
      request: {
        method: 'bar',
        params: {
          foo: 'bar',
        },
      },
    };

    expectTypeOf(cronjob).toMatchTypeOf<Cronjob>();
  });
});

describe('Bip32Entropy', () => {
  it('supports secp256k1', () => {
    const entropy = {
      curve: 'secp256k1' as const,
      path: ['m', "44'"],
    };

    expectTypeOf(entropy).toMatchTypeOf<Bip32Entropy>();
  });

  it('supports ed25519', () => {
    const entropy = {
      curve: 'ed25519' as const,
      path: ['m', "44'"],
    };

    expectTypeOf(entropy).toMatchTypeOf<Bip32Entropy>();
  });

  it('supports ed25519Bip32', () => {
    const entropy = {
      curve: 'ed25519Bip32' as const,
      path: ['m', "44'"],
    };

    expectTypeOf(entropy).toMatchTypeOf<Bip32Entropy>();
  });
});

describe('Bip44Entropy', () => {
  it('has a coin type', () => {
    const entropy = {
      coinType: 60,
    };

    expectTypeOf(entropy).toMatchTypeOf<Bip44Entropy>();
  });
});

describe('RequestedSnap', () => {
  it('has an optional version', () => {
    const snap = {
      version: '1.0.0',
    };

    expectTypeOf(snap).toMatchTypeOf<RequestedSnap>();
  });

  it('works without version', () => {
    const snap = {};

    expectTypeOf(snap).toMatchTypeOf<RequestedSnap>();
  });
});

describe('InitialPermissions', () => {
  it('does not accept anything for certain permissions', () => {
    const permissions = {
      'endowment:network-access': {
        foo: 'bar',
      },
    };

    expectTypeOf(permissions).not.toMatchTypeOf<InitialPermissions>();
  });
});

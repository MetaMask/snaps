import crypto from './crypto';

describe('Crypto endowment', () => {
  it('has expected properties', () => {
    expect(crypto).toMatchObject({
      names: ['crypto', 'SubtleCrypto'],
      factory: expect.any(Function),
    });
  });

  it('returns crypto from rootRealmGlobal', () => {
    Object.defineProperty(globalThis, 'crypto', {
      value: {},
      writable: true,
    });

    Object.defineProperty(globalThis, 'SubtleCrypto', {
      value: () => undefined,
      writable: true,
    });

    expect(crypto.factory()).toStrictEqual({
      crypto: globalThis.crypto,
      SubtleCrypto: globalThis.SubtleCrypto,
    });

    Object.assign(globalThis, {
      crypto: undefined,
      SubtleCrypto: undefined,
    });
  });
});

import crypto from './crypto';

jest.mock('crypto', () => ({
  webcrypto: {
    mock: true,
    subtle: { mock: true, constructor: { mock: true } },
  },
}));

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
      ...globalThis,
      crypto: undefined,
      SubtleCrypto: undefined,
    });
  });

  it('returns Node.js webcrypto module', () => {
    // eslint-disable-next-line jest/prefer-strict-equal
    expect(crypto.factory()).toEqual({
      crypto: {
        mock: true,
        subtle: { mock: true, constructor: { mock: true } },
      },
      SubtleCrypto: { mock: true },
    });
  });
});

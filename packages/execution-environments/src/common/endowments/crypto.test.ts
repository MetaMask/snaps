import crypto from './crypto';

jest.mock('crypto', () => ({
  webcrypto: { mock: true, subtle: { mock: true } },
}));

describe('Crypto endowment', () => {
  it('has expected properties', () => {
    expect(crypto).toMatchObject({
      names: ['crypto', 'SubtleCrypto'],
      factory: expect.any(Function),
    });
  });

  it('returns crypto from rootRealmGlobal', () => {
    Object.defineProperty(window, 'crypto', {
      value: {},
      writable: true,
    });

    Object.defineProperty(window, 'SubtleCrypto', {
      value: {},
      writable: true,
    });

    expect(crypto.factory()).toStrictEqual({
      crypto: window.crypto,
      SubtleCrypto: window.SubtleCrypto,
    });

    Object.assign(window, {
      ...window,
      crypto: undefined,
      SubtleCrypto: undefined,
    });
  });

  it('returns Node.js webcrypto module', () => {
    expect(crypto.factory()).toStrictEqual({
      crypto: { mock: true, subtle: { mock: true } },
      SubtleCrypto: { mock: true },
    });
  });
});

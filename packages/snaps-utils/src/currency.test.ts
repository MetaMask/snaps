import { create } from '@metamask/superstruct';

import { currency } from './currency';

describe('currency', () => {
  it('returns a struct that accepts the currency symbol in either case', () => {
    const CurrencyStruct = currency('usd');

    expect(create('usd', CurrencyStruct)).toBe('usd');
    expect(create('USD', CurrencyStruct)).toBe('usd');
  });

  it.each([undefined, 42, {}, [], 'eur'])(
    'returns a struct that rejects invalid currency symbols',
    (value) => {
      const CurrencyStruct = currency('usd');

      expect(() => create(value, CurrencyStruct)).toThrow(
        /Expected the literal `"usd"`, but received: .*/u,
      );
    },
  );
});

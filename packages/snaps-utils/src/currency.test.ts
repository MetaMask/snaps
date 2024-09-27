import { create } from '@metamask/superstruct';

import { currency } from './currency';

describe('currency', () => {
  it('returns a struct that accepts the currency symbol in either case', () => {
    const CurrencyStruct = currency('usd');

    expect(create('usd', CurrencyStruct)).toBe('usd');
    expect(create('USD', CurrencyStruct)).toBe('usd');
  });
});

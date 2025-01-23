import { is } from '@metamask/superstruct';

import { AssetConversionStruct } from './assets-conversion';

describe('AssetConversionStruct', () => {
  it.each([
    { rate: '1.23', conversionTime: 1737542312, expirationTime: 1737542312 },
    { rate: '1.23', conversionTime: 1737542312 },
  ])('validates an object', (value) => {
    expect(is(value, AssetConversionStruct)).toBe(true);
  });

  it.each([
    'foo',
    42,
    null,
    undefined,
    {},
    [],
    { rate: 123, conversionTime: 123 },
  ])('does not validate "%p"', (value) => {
    expect(is(value, AssetConversionStruct)).toBe(false);
  });
});

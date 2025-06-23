import { is } from '@metamask/superstruct';

import {
  AssetConversionStruct,
  OnAssetsConversionResponseStruct,
} from './assets-conversion';

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

describe('OnAssetsConversionResponseStruct', () => {
  it.each([
    {
      conversionRates: {
        'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp/token:EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v':
          {
            'swift:0/iso4217:USD': {
              rate: '1.23',
              conversionTime: 1737542312,
              expirationTime: 1737542312,
            },
          },
      },
    },
    {
      conversionRates: {
        'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp/token:EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v':
          {
            'swift:0/iso4217:USD': null,
          },
      },
    },
    { conversionRates: {} },
  ])('validates "%p"', (value) => {
    expect(is(value, OnAssetsConversionResponseStruct)).toBe(true);
  });

  it.each([
    'foo',
    42,
    null,
    undefined,
    {},
    [],
    {
      conversionRates: {
        'eip155:1:0x1234567890abcdef1234567890abcdef12345678': {
          'swift:0/iso4217:USD': {
            rate: 123,
            conversionTime: 123,
          },
        },
      },
    },
  ])('does not validate "%p"', (value) => {
    expect(is(value, OnAssetsConversionResponseStruct)).toBe(false);
  });
});

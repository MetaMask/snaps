import { is } from '@metamask/superstruct';

import {
  FungibleAssetMarketDataStruct,
  OnAssetsMarketDataResponseStruct,
  PricePercentChangeStruct,
} from './assets-market-data';

describe('PricePercentChangeStruct', () => {
  it.each([
    { all: 1.23 },
    { P1Y: 1.23, P1M: 1.23 },
    { all: 1.23, P1Y: 1.23, P1M: 1.23 },
  ])('validates "%p"', (value) => {
    expect(is(value, PricePercentChangeStruct)).toBe(true);
  });

  it.each(['foo', 42, null, undefined, {}, [], { all: 'foo' }])(
    'does not validate "%p"',
    (value) => {
      expect(is(value, PricePercentChangeStruct)).toBe(false);
    },
  );
});

describe('FungibleAssetMarketDataStruct', () => {
  it.each([
    {
      fungible: true,
      marketCap: '123',
      totalVolume: '123',
      circulatingSupply: '123',
      allTimeHigh: '123',
      allTimeLow: '123',
      pricePercentChange: { all: 1.23 },
    },
    {
      fungible: true,
      marketCap: '123',
      totalVolume: '123',
      circulatingSupply: '123',
      allTimeHigh: '123',
      allTimeLow: '123',
      pricePercentChange: { all: 1.23, P1Y: 1.23 },
    },
    {
      fungible: true,
      marketCap: '123',
      totalVolume: '123',
      circulatingSupply: '123',
      allTimeHigh: '123',
      pricePercentChange: { all: 1.23, P1Y: 1.23 },
    },
    { fungible: true },
  ])('validates "%p"', (value) => {
    expect(is(value, FungibleAssetMarketDataStruct)).toBe(true);
  });

  it.each([
    'foo',
    42,
    null,
    undefined,
    {},
    [],
    { allTimeHigh: 123 },
    { fungible: false },
  ])('does not validate "%p"', (value) => {
    expect(is(value, FungibleAssetMarketDataStruct)).toBe(false);
  });
});

describe('OnAssetsMarketDataResponseStruct', () => {
  it.each([
    {
      marketData: {
        'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp/token:EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v':
          {
            'swift:0/iso4217:USD': {
              fungible: true,
              marketCap: '123',
              totalVolume: '123',
              circulatingSupply: '123',
              allTimeHigh: '123',
              allTimeLow: '123',
              pricePercentChange: { all: 1.23 },
            },
          },
      },
    },
    {
      marketData: {
        'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp/token:EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v':
          {
            'swift:0/iso4217:USD': null,
          },
      },
    },
    { marketData: {} },
  ])('validates "%p"', (value) => {
    expect(is(value, OnAssetsMarketDataResponseStruct)).toBe(true);
  });

  it.each(['foo', 42, null, undefined, {}, [], { marketData: 123 }])(
    'does not validate "%p"',
    (value) => {
      expect(is(value, OnAssetsMarketDataResponseStruct)).toBe(false);
    },
  );
});

import { is } from '@metamask/superstruct';

import {
  AssetMarketDataStruct,
  AssetValueStruct,
  FungibleAssetMarketDataStruct,
  NonFungibleAssetMarketDataStruct,
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

describe('AssetValueStruct', () => {
  it.each([
    {
      asset:
        'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp/token:EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
      amount: '123',
    },
    {
      asset:
        'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp/nft:EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
      amount: '123',
    },
  ])('validates "%p"', (value) => {
    expect(is(value, AssetValueStruct)).toBe(true);
  });
  it.each(['foo', 42, null, undefined, {}, [], { asset: 'foo' }])(
    'does not validate "%p"',
    (value) => {
      expect(is(value, AssetValueStruct)).toBe(false);
    },
  );
});

describe('NonFungibleAssetMarketDataStruct', () => {
  it.each([
    {
      fungible: false,
      lastSale: {
        asset:
          'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp/nft:EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
        amount: '123',
      },
      topBid: {
        asset:
          'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp/nft:EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
        amount: '123',
      },
      floorPrice: {
        asset:
          'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp/nft:EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
        amount: '123',
      },
      rarity: {
        ranking: { source: 'source', rank: 1 },
        metadata: { attribute1: 1, attribute2: 2 },
      },
    },
    {
      fungible: false,
    },
  ])('validates "%p"', (value) => {
    expect(is(value, NonFungibleAssetMarketDataStruct)).toBe(true);
  });
  it.each([
    'foo',
    42,
    null,
    undefined,
    {},
    [],
    { fungible: true },
    {
      lastSale: {
        asset:
          'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp/token:EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
        amount: 123,
      },
    },
  ])('does not validate "%p"', (value) => {
    expect(is(value, NonFungibleAssetMarketDataStruct)).toBe(false);
  });
});

describe('AssetMarketDataStruct', () => {
  it.each([
    {
      fungible: false,
      lastSale: {
        asset:
          'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp/nft:EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
        amount: '123',
      },
      topBid: {
        asset:
          'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp/nft:EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
        amount: '123',
      },
      floorPrice: {
        asset:
          'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp/nft:EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
        amount: '123',
      },
      rarity: {
        ranking: { source: 'source', rank: 1 },
        metadata: { attribute1: 1, attribute2: 2 },
      },
    },
    {
      fungible: true,
      marketCap: '123',
      totalVolume: '123',
      circulatingSupply: '123',
      allTimeHigh: '123',
      allTimeLow: '123',
      pricePercentChange: { all: 1.23 },
    },
  ])('validates "%p"', (value) => {
    expect(is(value, AssetMarketDataStruct)).toBe(true);
  });

  it.each([
    'foo',
    42,
    null,
    undefined,
    {},
    [],
    { fungible: true, lastSale: {} },
    { fungible: false, marketCap: '123' },
  ])('does not validate "%p"', (value) => {
    expect(is(value, AssetMarketDataStruct)).toBe(false);
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
        'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp/nft:EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v':
          {
            'swift:0/iso4217:USD': {
              fungible: false,
              lastSale: {
                asset:
                  'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp/token:EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
                amount: '123',
              },
              topBid: {
                asset:
                  'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp/token:EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
                amount: '123',
              },
              floorPrice: {
                asset:
                  'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp/token:EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
                amount: '123',
              },
              rarity: {
                ranking: { source: 'source', rank: 1 },
                metadata: { attribute1: 1, attribute2: 2 },
              },
            },
          },
      },
    },
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
        'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp/nft:EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v':
          {
            'swift:0/iso4217:USD': {
              fungible: false,
              lastSale: {
                asset:
                  'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp/token:EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
                amount: '123',
              },
              topBid: {
                asset:
                  'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp/token:EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
                amount: '123',
              },
              floorPrice: {
                asset:
                  'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp/token:EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
                amount: '123',
              },
              rarity: {
                ranking: { source: 'source', rank: 1 },
                metadata: { attribute1: 1, attribute2: 2 },
              },
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

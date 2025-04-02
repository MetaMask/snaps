import { is } from '@metamask/superstruct';

import {
  AssetHistoricalPriceStruct,
  HistoricalPriceStruct,
  OnAssetHistoricalPriceResponseStruct,
} from './asset-historical-price';

describe('HistoricalPriceStruct', () => {
  it('validates an object', () => {
    const value = {
      P1D: [
        [1737542312, '1'],
        [1737542312, '2'],
      ],
      P1W: [
        [1737542312, '1'],
        [1737542312, '2'],
      ],
    };

    expect(is(value, HistoricalPriceStruct)).toBe(true);
  });

  it.each([
    'foo',
    42,
    null,
    undefined,
    {},
    [],
    {
      foo: [
        [1737542312, '1'],
        [1737542312, '2'],
      ],
    },
  ])('does not validate "%p"', (value) => {
    expect(is(value, HistoricalPriceStruct)).toBe(false);
  });
});

describe('AssetHistoricalPriceStruct', () => {
  it.each([
    {
      intervals: {
        P1D: [
          [1737542312, '1'],
          [1737542312, '2'],
        ],
        P1W: [
          [1737542312, '1'],
          [1737542312, '2'],
        ],
      },
      updateTime: 1737542312,
      expirationTime: 1737542312,
    },
    {
      intervals: {
        P1D: [
          [1737542312, '1'],
          [1737542312, '2'],
        ],
        P1W: [
          [1737542312, '1'],
          [1737542312, '2'],
        ],
      },
      updateTime: 1737542312,
    },
    null,
  ])('validates an object', (value) => {
    expect(is(value, AssetHistoricalPriceStruct)).toBe(true);
  });

  it.each([
    'foo',
    42,
    undefined,
    {},
    [],
    {
      intervals: {
        foo: [
          [1737542312, '1'],
          [1737542312, '2'],
        ],
      },
      updateTime: 1737542312,
    },
  ])('does not validate "%p"', (value) => {
    expect(is(value, AssetHistoricalPriceStruct)).toBe(false);
  });
});

describe('OnAssetHistoricalPriceResponseStruct', () => {
  it.each([
    {
      historicalPrice: {
        intervals: {
          P1D: [
            [1737542312, '1'],
            [1737542312, '2'],
          ],
          P1W: [
            [1737542312, '1'],
            [1737542312, '2'],
          ],
        },
        updateTime: 1737542312,
        expirationTime: 1737542312,
      },
    },
    {
      historicalPrice: {
        intervals: {
          P1D: [
            [1737542312, '1'],
            [1737542312, '2'],
          ],
          P1W: [
            [1737542312, '1'],
            [1737542312, '2'],
          ],
        },
        updateTime: 1737542312,
      },
    },
    {
      historicalPrice: null,
    },
  ])('validates "%p"', (value) => {
    expect(is(value, OnAssetHistoricalPriceResponseStruct)).toBe(true);
  });

  it.each([
    'foo',
    42,
    undefined,
    {},
    [],
    {
      historicalPrice: {
        historicalPrice: {
          foo: [
            [1737542312, '1'],
            [1737542312, '2'],
          ],
        },
      },
    },
    {
      historicalPrice: {
        historicalPrice: {
          foo: [
            [1737542312, '1'],
            [1737542312, '2'],
          ],
        },
        expirationTime: 1737542312,
      },
    },
  ])('does not validate "%p"', (value) => {
    expect(is(value, OnAssetHistoricalPriceResponseStruct)).toBe(false);
  });
});

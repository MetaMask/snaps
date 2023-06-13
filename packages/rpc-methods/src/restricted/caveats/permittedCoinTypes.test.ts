import { SnapCaveatType } from '@metamask/snaps-utils';

import {
  permittedCoinTypesCaveatMapper,
  validateBIP44Params,
  validateBIP44Caveat,
  PermittedCoinTypesCaveatSpecification,
} from './permittedCoinTypes';

describe('permittedCoinTypesCaveatMapper', () => {
  it('returns a caveat value for an array of coin types', () => {
    expect(
      permittedCoinTypesCaveatMapper([
        {
          coinType: 1,
        },
        {
          coinType: 60,
        },
      ]),
    ).toStrictEqual({
      caveats: [
        {
          type: SnapCaveatType.PermittedCoinTypes,
          value: [
            {
              coinType: 1,
            },
            {
              coinType: 60,
            },
          ],
        },
      ],
    });
  });
});

describe('validateBIP44Params', () => {
  it.each([true, false, null, undefined, 'foo', [], new (class {})()])(
    'throws if the value is not a plain object',
    (value) => {
      expect(() => validateBIP44Params(value)).toThrow(
        'Expected a plain object containing a coin type.',
      );
    },
  );

  it.each([
    {},
    [],
    true,
    false,
    null,
    undefined,
    'foo',
    -1,
    1.1,
    Infinity,
    -Infinity,
    NaN,
    0x80000000,
  ])('throws an error if the coin type is invalid', (value) => {
    expect(() => {
      validateBIP44Params({ coinType: value });
    }).toThrow(
      'Invalid "coinType" parameter. Coin type must be a non-negative integer.',
    );
  });
});

describe('validateBIP44Caveat', () => {
  it.each([
    { type: SnapCaveatType.PermittedCoinTypes },
    { type: SnapCaveatType.PermittedCoinTypes, value: {} },
    { type: SnapCaveatType.PermittedCoinTypes, value: [] },
  ])('throws if the caveat is invalid', (caveat) => {
    // @ts-expect-error Invalid caveat type.
    expect(() => validateBIP44Caveat(caveat)).toThrow(
      'Expected non-empty array of coin types.',
    );
  });

  it.each([
    {},
    [],
    true,
    false,
    null,
    undefined,
    'foo',
    -1,
    1.1,
    Infinity,
    -Infinity,
    NaN,
    0x80000000,
  ])('throws if the caveat values are invalid', (value) => {
    expect(() =>
      validateBIP44Caveat({
        type: SnapCaveatType.PermittedCoinTypes,
        value: [{ coinType: value }],
      }),
    ).toThrow(
      'Invalid "coinType" parameter. Coin type must be a non-negative integer.',
    );
  });
});

describe('PermittedCoinTypesCaveatSpecification', () => {
  describe('decorator', () => {
    const params = { coinType: 1 };

    it('returns the result of the method implementation', async () => {
      const fn = jest.fn().mockImplementation(() => 'foo');

      expect(
        await PermittedCoinTypesCaveatSpecification[
          SnapCaveatType.PermittedCoinTypes
        ].decorator(fn, {
          type: SnapCaveatType.PermittedCoinTypes,
          value: [params],
          // @ts-expect-error Missing other required properties.
        })({ params }),
      ).toBe('foo');
    });

    it('throws if the coin type is invalid', async () => {
      const fn = jest.fn().mockImplementation(() => 'foo');

      await expect(
        PermittedCoinTypesCaveatSpecification[
          SnapCaveatType.PermittedCoinTypes
        ].decorator(fn, {
          type: SnapCaveatType.PermittedDerivationPaths,
          value: [params],
          // @ts-expect-error Missing other required properties.
        })({ params: { coinType: -1 } }),
      ).rejects.toThrow(
        'Invalid "coinType" parameter. Coin type must be a non-negative integer.',
      );
    });

    it('throws if the coin type is not specified in the caveats', async () => {
      const fn = jest.fn().mockImplementation(() => 'foo');

      await expect(
        PermittedCoinTypesCaveatSpecification[
          SnapCaveatType.PermittedCoinTypes
        ].decorator(fn, {
          type: SnapCaveatType.PermittedCoinTypes,
          value: [params],
          // @ts-expect-error Missing other required properties.
        })({ params: { coinType: 2 } }),
      ).rejects.toThrow(
        'The requested coin type is not permitted. Allowed coin types must be specified in the snap manifest.',
      );
    });

    it('throws if the coin type is not allowed', async () => {
      const fn = jest.fn().mockImplementation(() => 'foo');

      await expect(
        PermittedCoinTypesCaveatSpecification[
          SnapCaveatType.PermittedCoinTypes
        ].decorator(fn, {
          type: SnapCaveatType.PermittedCoinTypes,
          value: [{ coinType: 60 }],
          // @ts-expect-error Missing other required properties.
        })({ params: { coinType: 60 } }),
      ).rejects.toThrow('Coin type 60 is forbidden.');
    });
  });

  describe('validator', () => {
    it('throws if the caveat values are invalid', () => {
      expect(() =>
        PermittedCoinTypesCaveatSpecification[
          SnapCaveatType.PermittedCoinTypes
        ].validator?.({
          type: SnapCaveatType.PermittedCoinTypes,
          value: [{ coinType: -1 }],
        }),
      ).toThrow(
        'Invalid "coinType" parameter. Coin type must be a non-negative integer.',
      );
    });
  });
});

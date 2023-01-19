import { SnapCaveatType } from '@metamask/snaps-utils';
import { TEST_SECRET_RECOVERY_PHRASE_BYTES } from '@metamask/snaps-utils/test-utils';

import {
  getBip44EntropyBuilder,
  getBip44EntropyCaveatMapper,
  getBip44EntropyCaveatSpecifications,
  getBip44EntropyImplementation,
  validateCaveat,
  validateParams,
} from './getBip44Entropy';

describe('validateParams', () => {
  it.each([true, false, null, undefined, 'foo', [], new (class {})()])(
    'throws if the value is not a plain object',
    (value) => {
      expect(() => validateParams(value)).toThrow(
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
      validateParams({ coinType: value });
    }).toThrow(
      'Invalid "coinType" parameter. Coin type must be a non-negative integer.',
    );
  });
});

describe('validateCaveat', () => {
  it.each([
    { type: SnapCaveatType.PermittedCoinTypes },
    { type: SnapCaveatType.PermittedCoinTypes, value: {} },
    { type: SnapCaveatType.PermittedCoinTypes, value: [] },
  ])('throws if the caveat is invalid', (caveat) => {
    // @ts-expect-error Invalid caveat type.
    expect(() => validateCaveat(caveat)).toThrow(
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
      validateCaveat({
        type: SnapCaveatType.PermittedCoinTypes,
        value: [{ coinType: value }],
      }),
    ).toThrow(
      'Invalid "coinType" parameter. Coin type must be a non-negative integer.',
    );
  });
});

describe('specificationBuilder', () => {
  const methodHooks = {
    getMnemonic: jest.fn(),
    getUnlockPromise: jest.fn(),
  };

  const specification = getBip44EntropyBuilder.specificationBuilder({
    methodHooks,
  });

  describe('validator', () => {
    it('throws if the caveat is not a single "permittedCoinTypes"', () => {
      expect(() =>
        // @ts-expect-error Missing required permission types.
        specification.validator({}),
      ).toThrow('Expected a single "permittedCoinTypes" caveat.');

      expect(() =>
        // @ts-expect-error Missing other required permission types.
        specification.validator({
          caveats: [{ type: 'foo', value: 'bar' }],
        }),
      ).toThrow('Expected a single "permittedCoinTypes" caveat.');

      expect(() =>
        // @ts-expect-error Missing other required permission types.
        specification.validator({
          caveats: [
            { type: 'permittedCoinTypes', value: [] },
            { type: 'permittedCoinTypes', value: [] },
          ],
        }),
      ).toThrow('Expected a single "permittedCoinTypes" caveat.');
    });
  });
});

describe('getBip44EntropyCaveatMapper', () => {
  it('returns a caveat value for an array of coin types', () => {
    expect(
      getBip44EntropyCaveatMapper([
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

describe('getBip44EntropyCaveatSpecifications', () => {
  describe('decorator', () => {
    const params = { coinType: 1 };

    it('returns the result of the method implementation', async () => {
      const fn = jest.fn().mockImplementation(() => 'foo');

      expect(
        await getBip44EntropyCaveatSpecifications[
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
        getBip44EntropyCaveatSpecifications[
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
        getBip44EntropyCaveatSpecifications[
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
  });

  describe('validator', () => {
    it('throws if the caveat values are invalid', () => {
      expect(() =>
        getBip44EntropyCaveatSpecifications[
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

describe('getBip44EntropyImplementation', () => {
  describe('getBip44Entropy', () => {
    it('derives the entropy from the path', async () => {
      const getUnlockPromise = jest.fn().mockResolvedValue(undefined);
      const getMnemonic = jest
        .fn()
        .mockResolvedValue(TEST_SECRET_RECOVERY_PHRASE_BYTES);

      expect(
        // @ts-expect-error Missing other required properties.
        await getBip44EntropyImplementation({ getUnlockPromise, getMnemonic })({
          params: { coinType: 1 },
        }),
      ).toMatchInlineSnapshot(`
        {
          "chainCode": "0x50ccfa58a885b48b5eed09486b3948e8454f34856fb81da5d7b8519d7997abd1",
          "coin_type": 1,
          "depth": 2,
          "index": 2147483649,
          "masterFingerprint": 1404659567,
          "parentFingerprint": 1829122711,
          "path": "m / bip32:44' / bip32:1'",
          "privateKey": "0xc73cedb996e7294f032766853a8b7ba11ab4ce9755fc052f2f7b9000044c99af",
          "publicKey": "0x048e129862c1de5ca86468add43b001d32fd34b8113de716ecd63fa355b7f1165f0e76f5dc6095100f9fdaa76ddf28aa3f21406ac5fda7c71ffbedb45634fe2ceb",
        }
      `);
    });
  });
});

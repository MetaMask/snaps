import { Caveat, OriginString } from '@metamask/permission-controller';
import {
  SnapCaveatType,
  SIP_6_MAGIC_VALUE,
  SnapId,
} from '@metamask/snaps-utils';
import { MOCK_SNAP_ID, MOCK_ORIGIN } from '@metamask/snaps-utils/test-utils';
import { Json } from '@metamask/utils';

import {
  permittedDerivationPathsCaveatMapper,
  permittedCoinTypesCaveatMapper,
  validateBIP32CaveatPaths,
  validateBIP44Params,
  validateBIP44Caveat,
  validateSnapIdsCaveat,
  PermittedDerivationPathsCaveatSpecification,
  PermittedCoinTypesCaveatSpecification,
  SnapIdsCaveatSpecification,
} from './caveats';

describe('Caveat mappers', () => {
  describe('permittedDerivationPathsCaveatMapper', () => {
    it('returns a caveat value for an array of paths', () => {
      expect(
        permittedDerivationPathsCaveatMapper([
          { path: ['m', "44'", "60'"], curve: 'secp256k1' },
          { path: ['m', "0'", "0'"], curve: 'ed25519' },
        ]),
      ).toStrictEqual({
        caveats: [
          {
            type: SnapCaveatType.PermittedDerivationPaths,
            value: [
              { path: ['m', "44'", "60'"], curve: 'secp256k1' },
              { path: ['m', "0'", "0'"], curve: 'ed25519' },
            ],
          },
        ],
      });
    });
  });

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
});

describe('Caveat validation functions', () => {
  describe('validateBIP32CaveatPaths', () => {
    it.each([[], null, undefined, 'foo'])(
      'throws if the value is not an array or empty',
      (value) => {
        expect(() =>
          validateBIP32CaveatPaths({
            type: SnapCaveatType.PermittedDerivationPaths,
            value,
          }),
        ).toThrow(
          /^Invalid BIP-32 entropy caveat: At path: value -- Expected an? array/u,
        ); // Different error messages for different types
      },
    );

    it('throws if any of the paths is invalid', () => {
      expect(() =>
        validateBIP32CaveatPaths({
          type: SnapCaveatType.PermittedDerivationPaths,
          value: [{ path: ['foo'], curve: 'secp256k1' }],
        }),
      ).toThrow('At path: value.0.path -- Path must start with "m".');
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

  describe('validateSnapIdsCaveats', () => {
    it('validates that a caveat has a non-empty object as a caveat value', () => {
      const caveat = {
        type: SnapCaveatType.SnapIds,
        value: { [MOCK_SNAP_ID]: {} },
      };
      const missingValueCaveat = {
        type: SnapCaveatType.SnapIds,
      };
      const emptyValueCaveat = {
        type: SnapCaveatType.SnapIds,
        value: {},
      };
      expect(() => validateSnapIdsCaveat(caveat)).not.toThrow();
      expect(() =>
        validateSnapIdsCaveat(missingValueCaveat as Caveat<string, Json>),
      ).toThrow(
        'Expected caveat to have a value property of a non-empty object of snap IDs.',
      );
      expect(() => validateSnapIdsCaveat(emptyValueCaveat)).toThrow(
        'Expected caveat to have a value property of a non-empty object of snap IDs.',
      );
    });
  });
});

describe('Caveat specifications', () => {
  describe('PermittedDerivationPathsCaveatSpecification', () => {
    describe('decorator', () => {
      const params = { path: ['m', "44'", "60'"], curve: 'secp256k1' };

      it('returns the result of the method implementation', async () => {
        const fn = jest.fn().mockImplementation(() => 'foo');

        expect(
          await PermittedDerivationPathsCaveatSpecification[
            SnapCaveatType.PermittedDerivationPaths
          ].decorator(fn, {
            type: SnapCaveatType.PermittedDerivationPaths,
            value: [params],
            // @ts-expect-error Missing other required properties.
          })({ params }),
        ).toBe('foo');
      });

      it('allows deriving child nodes', async () => {
        const fn = jest.fn().mockImplementation(() => 'foo');

        expect(
          await PermittedDerivationPathsCaveatSpecification[
            SnapCaveatType.PermittedDerivationPaths
          ].decorator(fn, {
            type: SnapCaveatType.PermittedDerivationPaths,
            value: [params],
            // @ts-expect-error Missing other required properties.
          })({
            params: {
              path: ['m', "44'", "60'", "0'", '0', '1'],
              curve: 'secp256k1',
            },
          }),
        ).toBe('foo');
      });

      it('allows deriving deep nodes', async () => {
        const fn = jest.fn().mockImplementation(() => 'foo');

        expect(
          await PermittedDerivationPathsCaveatSpecification[
            SnapCaveatType.PermittedDerivationPaths
          ].decorator(fn, {
            type: SnapCaveatType.PermittedDerivationPaths,
            value: [params],
            // @ts-expect-error Missing other required properties.
          })({
            params: {
              path: [
                'm',
                "44'",
                "60'",
                "0'",
                '0',
                '1',
                '2',
                '3',
                '4',
                '5',
                '6',
                '7',
                '8',
                '9',
                '10',
              ],
              curve: 'secp256k1',
            },
          }),
        ).toBe('foo');
      });

      it('ignores unknown fields', async () => {
        const fn = jest.fn().mockImplementation(() => 'foo');

        expect(
          await PermittedDerivationPathsCaveatSpecification[
            SnapCaveatType.PermittedDerivationPaths
          ].decorator(fn, {
            type: SnapCaveatType.PermittedDerivationPaths,
            value: [params],
            // @ts-expect-error Missing other required properties.
          })({
            params: {
              path: ['m', "44'", "60'", "0'", '0', '1'],
              curve: 'secp256k1',
              compressed: true,
            },
          }),
        ).toBe('foo');
      });

      it('throws if the path is invalid', async () => {
        const fn = jest.fn().mockImplementation(() => 'foo');

        await expect(
          PermittedDerivationPathsCaveatSpecification[
            SnapCaveatType.PermittedDerivationPaths
          ].decorator(fn, {
            type: SnapCaveatType.PermittedDerivationPaths,
            value: [params],
            // @ts-expect-error Missing other required properties.
          })({ params: { ...params, path: [] } }),
        ).rejects.toThrow(
          'At path: path -- Path must be a non-empty BIP-32 derivation path array',
        );
      });

      it('throws if the path is not specified in the caveats', async () => {
        const fn = jest.fn().mockImplementation(() => 'foo');

        await expect(
          PermittedDerivationPathsCaveatSpecification[
            SnapCaveatType.PermittedDerivationPaths
          ].decorator(fn, {
            type: SnapCaveatType.PermittedDerivationPaths,
            value: [params],
            // @ts-expect-error Missing other required properties.
          })({ params: { ...params, path: ['m', "44'", "0'"] } }),
        ).rejects.toThrow(
          'The requested path is not permitted. Allowed paths must be specified in the snap manifest.',
        );
      });

      it('throws if the purpose is not allowed', async () => {
        const fn = jest.fn().mockImplementation(() => 'foo');

        await expect(
          PermittedDerivationPathsCaveatSpecification[
            SnapCaveatType.PermittedDerivationPaths
          ].decorator(fn, {
            type: SnapCaveatType.PermittedDerivationPaths,
            value: [params],
            // @ts-expect-error Missing other required properties.
          })({ params: { ...params, path: ['m', SIP_6_MAGIC_VALUE, "0'"] } }),
        ).rejects.toThrow(
          'Invalid BIP-32 entropy path definition: At path: path -- The purpose "1399742832\'" is not allowed for entropy derivation.',
        );
      });
    });

    describe('validator', () => {
      it('throws if the caveat values are invalid', () => {
        expect(() =>
          PermittedDerivationPathsCaveatSpecification[
            SnapCaveatType.PermittedDerivationPaths
          ].validator?.({
            type: SnapCaveatType.PermittedDerivationPaths,
            value: [{ path: ['foo'], curve: 'secp256k1' }],
          }),
        ).toThrow('At path: value.0.path -- Path must start with "m".');
      });

      it('throws if the caveat values contain forbidden paths', () => {
        expect(() =>
          PermittedDerivationPathsCaveatSpecification[
            SnapCaveatType.PermittedDerivationPaths
          ].validator?.({
            type: SnapCaveatType.PermittedDerivationPaths,
            value: [
              { path: ['m', SIP_6_MAGIC_VALUE, "0'"], curve: 'secp256k1' },
            ],
          }),
        ).toThrow(
          'Invalid BIP-32 entropy caveat: At path: value.0.path -- The purpose "1399742832\'" is not allowed for entropy derivation.',
        );
      });
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

  describe('SnapIdsCaveatSpecification', () => {
    describe('validator', () => {
      it('throws for an invalid caveat object', () => {
        expect(() => {
          SnapIdsCaveatSpecification[SnapCaveatType.SnapIds].validator?.({
            type: SnapCaveatType.SnapIds,
            value: {},
          });
        }).toThrow(
          'Expected caveat to have a value property of a non-empty object of snap IDs.',
        );
      });
    });

    describe('decorator', () => {
      const params: { snapId: SnapId } = { snapId: MOCK_SNAP_ID };
      const context: { origin: OriginString } = { origin: MOCK_ORIGIN };
      it('returns the result of the method implementation', async () => {
        const caveat = {
          type: SnapCaveatType.SnapIds,
          value: { [MOCK_SNAP_ID]: {} },
        };
        const method = jest.fn().mockImplementation(() => 'foo');
        expect(
          await SnapIdsCaveatSpecification[SnapCaveatType.SnapIds].decorator(
            method,
            caveat,
          )({ method: 'hello', params, context }),
        ).toBe('foo');
      });

      it('throws if the origin trying to invoke the snap does not have its permission', async () => {
        const method = jest.fn().mockImplementation(() => 'foo');
        const caveat = { type: SnapCaveatType.SnapIds, value: { foo: {} } };
        await expect(
          SnapIdsCaveatSpecification[SnapCaveatType.SnapIds].decorator(
            method,
            caveat,
          )({ method: 'hello', params, context }),
        ).rejects.toThrow(
          `${MOCK_ORIGIN} does not have permission to invoke ${MOCK_SNAP_ID} snap.`,
        );
      });
    });
  });
});

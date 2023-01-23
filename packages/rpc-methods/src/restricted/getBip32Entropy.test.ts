import { SIP_6_MAGIC_VALUE, SnapCaveatType } from '@metamask/snaps-utils';
import { TEST_SECRET_RECOVERY_PHRASE_BYTES } from '@metamask/snaps-utils/test-utils';

import {
  getBip32EntropyBuilder,
  getBip32EntropyCaveatMapper,
  getBip32EntropyCaveatSpecifications,
  getBip32EntropyImplementation,
  validateCaveatPaths,
} from './getBip32Entropy';

describe('validateCaveatPaths', () => {
  it.each([[], null, undefined, 'foo'])(
    'throws if the value is not an array or empty',
    (value) => {
      expect(() =>
        validateCaveatPaths({
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
      validateCaveatPaths({
        type: SnapCaveatType.PermittedDerivationPaths,
        value: [{ path: ['foo'], curve: 'secp256k1' }],
      }),
    ).toThrow('At path: value.0.path -- Path must start with "m".');
  });
});

describe('specificationBuilder', () => {
  const methodHooks = {
    getMnemonic: jest.fn(),
    getUnlockPromise: jest.fn(),
  };

  const specification = getBip32EntropyBuilder.specificationBuilder({
    methodHooks,
  });

  describe('validator', () => {
    it('throws if the caveat is not a single "permittedDerivationPaths"', () => {
      expect(() =>
        // @ts-expect-error Missing required permission types.
        specification.validator({}),
      ).toThrow('Expected a single "permittedDerivationPaths" caveat.');

      expect(() =>
        // @ts-expect-error Missing other required permission types.
        specification.validator({
          caveats: [{ type: 'foo', value: 'bar' }],
        }),
      ).toThrow('Expected a single "permittedDerivationPaths" caveat.');

      expect(() =>
        // @ts-expect-error Missing other required permission types.
        specification.validator({
          caveats: [
            { type: 'permittedDerivationPaths', value: [] },
            { type: 'permittedDerivationPaths', value: [] },
          ],
        }),
      ).toThrow('Expected a single "permittedDerivationPaths" caveat.');
    });
  });
});

describe('getBip32EntropyCaveatMapper', () => {
  it('returns a caveat value for an array of paths', () => {
    expect(
      getBip32EntropyCaveatMapper([
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

describe('getBip32EntropyCaveatSpecifications', () => {
  describe('decorator', () => {
    const params = { path: ['m', "44'", "60'"], curve: 'secp256k1' };

    it('returns the result of the method implementation', async () => {
      const fn = jest.fn().mockImplementation(() => 'foo');

      expect(
        await getBip32EntropyCaveatSpecifications[
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
        await getBip32EntropyCaveatSpecifications[
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
        await getBip32EntropyCaveatSpecifications[
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
        await getBip32EntropyCaveatSpecifications[
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
        getBip32EntropyCaveatSpecifications[
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
        getBip32EntropyCaveatSpecifications[
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
        getBip32EntropyCaveatSpecifications[
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
        getBip32EntropyCaveatSpecifications[
          SnapCaveatType.PermittedDerivationPaths
        ].validator?.({
          type: SnapCaveatType.PermittedDerivationPaths,
          value: [{ path: ['foo'], curve: 'secp256k1' }],
        }),
      ).toThrow('At path: value.0.path -- Path must start with "m".');
    });

    it('throws if the caveat values contain forbidden paths', () => {
      expect(() =>
        getBip32EntropyCaveatSpecifications[
          SnapCaveatType.PermittedDerivationPaths
        ].validator?.({
          type: SnapCaveatType.PermittedDerivationPaths,
          value: [{ path: ['m', SIP_6_MAGIC_VALUE, "0'"], curve: 'secp256k1' }],
        }),
      ).toThrow(
        'Invalid BIP-32 entropy caveat: At path: value.0.path -- The purpose "1399742832\'" is not allowed for entropy derivation.',
      );
    });
  });
});

describe('getBip32EntropyImplementation', () => {
  describe('getBip32Entropy', () => {
    it('derives the entropy from the path', async () => {
      const getUnlockPromise = jest.fn().mockResolvedValue(undefined);
      const getMnemonic = jest
        .fn()
        .mockResolvedValue(TEST_SECRET_RECOVERY_PHRASE_BYTES);

      expect(
        // @ts-expect-error Missing other required properties.
        await getBip32EntropyImplementation({ getUnlockPromise, getMnemonic })({
          params: { path: ['m', "44'", "60'"], curve: 'secp256k1' },
        }),
      ).toMatchInlineSnapshot(`
        {
          "chainCode": "0xc4d424c253ca0eab92de6d8c819a37889e15a11bbf1cb6a48ffca2faef1f4d4d",
          "curve": "secp256k1",
          "depth": 2,
          "index": 2147483708,
          "masterFingerprint": 1404659567,
          "parentFingerprint": 1829122711,
          "privateKey": "0xca8d3571710e2b08628926f0ec14983aded0fd039518c59522c004e0e7eb4f5a",
          "publicKey": "0x041e31e8432aab932fe18b5f9798b7252394ff0b943920b40c50a79301062df5ece2b884a45c456241e35000137e6dbd92c9119ccd5f46cc92ba9568ca661b994b",
        }
      `);
    });

    it('derives a BIP-44 path', async () => {
      const getUnlockPromise = jest.fn().mockResolvedValue(undefined);
      const getMnemonic = jest
        .fn()
        .mockResolvedValue(TEST_SECRET_RECOVERY_PHRASE_BYTES);

      expect(
        // @ts-expect-error Missing other required properties.
        await getBip32EntropyImplementation({ getUnlockPromise, getMnemonic })({
          params: {
            path: ['m', "44'", "60'", "0'", '0', '1'],
            curve: 'secp256k1',
          },
        }),
      ).toMatchInlineSnapshot(`
        {
          "chainCode": "0x6265b647bc0e70480f29856be102fe866ea6a8ec9e2926c198c2e9c4cd268a43",
          "curve": "secp256k1",
          "depth": 5,
          "index": 1,
          "masterFingerprint": 1404659567,
          "parentFingerprint": 942995271,
          "privateKey": "0x4adb19cafa5fdf467215fa30b56a50facac2dee40a7015063c6a7a0f1f4e2576",
          "publicKey": "0x04b21938e18aec1e2e7478988ccae5b556597d771c8e46ac2c8ea2a4a1a80619679230a109cd30e8af15856b15799e38991e45e55f406a8a24d5605ba0757da53c",
        }
      `);
    });

    it('derives a path using ed25519', async () => {
      const getUnlockPromise = jest.fn().mockResolvedValue(undefined);
      const getMnemonic = jest
        .fn()
        .mockResolvedValue(TEST_SECRET_RECOVERY_PHRASE_BYTES);

      expect(
        // @ts-expect-error Missing other required properties.
        await getBip32EntropyImplementation({ getUnlockPromise, getMnemonic })({
          params: {
            path: ['m', "44'", "60'", "0'", "0'", "1'"],
            curve: 'ed25519',
          },
        }),
      ).toMatchInlineSnapshot(`
        {
          "chainCode": "0xc258fb2565397094f6fbc5b21b5a51a2dd573748ba752b192babadcd21426015",
          "curve": "ed25519",
          "depth": 5,
          "index": 2147483649,
          "masterFingerprint": 650419359,
          "parentFingerprint": 497597606,
          "privateKey": "0x4ef4bf3da2c6a47495d24303b7c463dca03fe164ca1550f2d60aa68e5134d6c1",
          "publicKey": "0x009e76714baba27091db7a5abee8e1cd8416a5d78580e8dde15d68fb78ed930097",
        }
      `);
    });
  });
});

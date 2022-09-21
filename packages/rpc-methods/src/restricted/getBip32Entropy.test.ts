import { SnapCaveatType } from '@metamask/snap-utils';
import {
  getBip32EntropyBuilder,
  getBip32EntropyCaveatMapper,
  getBip32EntropyCaveatSpecifications,
  getBip32EntropyImplementation,
  validateCaveatPaths,
  validatePath,
} from './getBip32Entropy';

const TEST_SECRET_RECOVERY_PHRASE =
  'test test test test test test test test test test test ball';

describe('validatePath', () => {
  it.each([true, false, null, undefined, 'foo', [], new (class {})()])(
    'throws if the value is not a plain object',
    (value) => {
      expect(() => validatePath(value)).toThrow('Expected a plain object.');
    },
  );

  it.each([{}, { path: [] }, { path: 'foo' }])(
    'throws if the path is invalid or empty',
    () => {
      expect(() => validatePath({})).toThrow(
        'Invalid "path" parameter. The path must be a non-empty BIP-32 derivation path array.',
      );
    },
  );

  it('throws if the path does not start with "m"', () => {
    expect(() => validatePath({ path: ["44'", "60'"] })).toThrow(
      'Invalid "path" parameter. The path must start with "m".',
    );
  });

  it.each([
    { path: ['m', 'foo'] },
    { path: ['m', '0', 'bar'] },
    { path: ['m', 0] },
  ])('throws if the path is invalid', (value) => {
    expect(() => validatePath(value)).toThrow(
      'Invalid "path" parameter. The path must be a valid BIP-32 derivation path array.',
    );
  });

  it.each([{ path: ['m'] }, { path: ['m', "44'"] }])(
    'throws if the path has a length of less than three',
    (value) => {
      expect(() => validatePath(value)).toThrow(
        'Invalid "path" parameter. Paths must have a length of at least three.',
      );
    },
  );

  it('throws if the curve is invalid', () => {
    expect(() =>
      validatePath({ path: ['m', "44'", "60'"], curve: 'foo' }),
    ).toThrow(
      'Invalid "curve" parameter. The curve must be "secp256k1" or "ed25519".',
    );
  });

  it('throws if the curve is ed25519 and the path has an unhardened index', () => {
    expect(() =>
      validatePath({ path: ['m', "44'", "60'", '1'], curve: 'ed25519' }),
    ).toThrow(
      'Invalid "path" parameter. Ed25519 does not support unhardened paths.',
    );
  });

  it('does not throw if the path is valid', () => {
    expect(() =>
      validatePath({ path: ['m', "44'", "60'"], curve: 'secp256k1' }),
    ).not.toThrow();

    expect(() =>
      validatePath({ path: ['m', "44'", "60'"], curve: 'ed25519' }),
    ).not.toThrow();
  });
});

describe('validateCaveatPaths', () => {
  it.each([[], null, undefined, 'foo'])(
    'throws if the value is not an array or empty',
    (value) => {
      expect(() =>
        validateCaveatPaths({
          type: SnapCaveatType.PermittedDerivationPaths,
          value,
        }),
      ).toThrow('Expected non-empty array of paths.');
    },
  );

  it('throws if any of the paths is invalid', () => {
    expect(() =>
      validateCaveatPaths({
        type: SnapCaveatType.PermittedDerivationPaths,
        value: [{ path: ['foo'], curve: 'secp256k1' }],
      }),
    ).toThrow('Invalid "path" parameter. The path must start with "m".');
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
        'Invalid "path" parameter. The path must be a non-empty BIP-32 derivation path array.',
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
      ).toThrow('Invalid "path" parameter. The path must start with "m".');
    });
  });
});

describe('getBip32EntropyImplementation', () => {
  describe('getBip32Entropy', () => {
    it('derives the entropy from the path', async () => {
      const getUnlockPromise = jest.fn().mockResolvedValue(undefined);
      const getMnemonic = jest
        .fn()
        .mockResolvedValue(TEST_SECRET_RECOVERY_PHRASE);

      expect(
        // @ts-expect-error Missing other required properties.
        await getBip32EntropyImplementation({ getUnlockPromise, getMnemonic })({
          params: { path: ['m', "44'", "60'"], curve: 'secp256k1' },
        }),
      ).toMatchInlineSnapshot(`
        {
          "chainCode": "c4d424c253ca0eab92de6d8c819a37889e15a11bbf1cb6a48ffca2faef1f4d4d",
          "curve": "secp256k1",
          "depth": 2,
          "index": 2147483708,
          "masterFingerprint": 1404659567,
          "parentFingerprint": 1829122711,
          "privateKey": "ca8d3571710e2b08628926f0ec14983aded0fd039518c59522c004e0e7eb4f5a",
          "publicKey": "041e31e8432aab932fe18b5f9798b7252394ff0b943920b40c50a79301062df5ece2b884a45c456241e35000137e6dbd92c9119ccd5f46cc92ba9568ca661b994b",
        }
      `);
    });

    it('derives a BIP-44 path', async () => {
      const getUnlockPromise = jest.fn().mockResolvedValue(undefined);
      const getMnemonic = jest
        .fn()
        .mockResolvedValue(TEST_SECRET_RECOVERY_PHRASE);

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
          "chainCode": "6265b647bc0e70480f29856be102fe866ea6a8ec9e2926c198c2e9c4cd268a43",
          "curve": "secp256k1",
          "depth": 5,
          "index": 1,
          "masterFingerprint": 1404659567,
          "parentFingerprint": 942995271,
          "privateKey": "4adb19cafa5fdf467215fa30b56a50facac2dee40a7015063c6a7a0f1f4e2576",
          "publicKey": "04b21938e18aec1e2e7478988ccae5b556597d771c8e46ac2c8ea2a4a1a80619679230a109cd30e8af15856b15799e38991e45e55f406a8a24d5605ba0757da53c",
        }
      `);
    });
  });
});

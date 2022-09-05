import { SnapCaveatType } from '../caveats';
import {
  getBip32PublicKeyBuilder,
  getBip32PublicKeyCaveatMapper,
  getBip32PublicKeyCaveatSpecifications,
  getBip32PublicKeyImplementation,
} from './getBip32PublicKey';

const TEST_SECRET_RECOVERY_PHRASE =
  'test test test test test test test test test test test ball';

describe('specificationBuilder', () => {
  const methodHooks = {
    getMnemonic: jest.fn(),
    getUnlockPromise: jest.fn(),
  };

  const specification = getBip32PublicKeyBuilder.specificationBuilder({
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

describe('getBip32PublicKeyCaveatMapper', () => {
  it('returns a caveat value for an array of paths', () => {
    expect(
      getBip32PublicKeyCaveatMapper([
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

describe('getBip32PublicKeyCaveatSpecifications', () => {
  describe('decorator', () => {
    const params = { path: ['m', "44'", "60'"], curve: 'secp256k1' };

    it('returns the result of the method implementation', async () => {
      const fn = jest.fn().mockImplementation(() => 'foo');

      expect(
        await getBip32PublicKeyCaveatSpecifications[
          SnapCaveatType.PermittedDerivationPaths
        ].decorator(fn, {
          type: SnapCaveatType.PermittedDerivationPaths,
          value: [params],
          // @ts-expect-error Missing other required properties.
        })({ params }),
      ).toBe('foo');
    });

    it('throws if the path is invalid', async () => {
      const fn = jest.fn().mockImplementation(() => 'foo');

      await expect(
        getBip32PublicKeyCaveatSpecifications[
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
        getBip32PublicKeyCaveatSpecifications[
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
        getBip32PublicKeyCaveatSpecifications[
          SnapCaveatType.PermittedDerivationPaths
        ].validator?.({
          type: SnapCaveatType.PermittedDerivationPaths,
          value: [{ path: ['foo'], curve: 'secp256k1' }],
        }),
      ).toThrow('Invalid "path" parameter. The path must start with "m".');
    });
  });
});

describe('getBip32PublicKeyImplementation', () => {
  describe('getBip32PublicKey', () => {
    it('derives the public key from the path', async () => {
      const getUnlockPromise = jest.fn().mockResolvedValue(undefined);
      const getMnemonic = jest
        .fn()
        .mockResolvedValue(TEST_SECRET_RECOVERY_PHRASE);

      expect(
        await getBip32PublicKeyImplementation({
          getUnlockPromise,
          getMnemonic,
          // @ts-expect-error Missing other required properties.
        })({
          params: { path: ['m', "44'", "60'"], curve: 'secp256k1' },
        }),
      ).toMatchInlineSnapshot(
        `"041e31e8432aab932fe18b5f9798b7252394ff0b943920b40c50a79301062df5ece2b884a45c456241e35000137e6dbd92c9119ccd5f46cc92ba9568ca661b994b"`,
      );
    });

    it('derives the compressed public key from the path', async () => {
      const getUnlockPromise = jest.fn().mockResolvedValue(undefined);
      const getMnemonic = jest
        .fn()
        .mockResolvedValue(TEST_SECRET_RECOVERY_PHRASE);

      expect(
        await getBip32PublicKeyImplementation({
          getUnlockPromise,
          getMnemonic,
          // @ts-expect-error Missing other required properties.
        })({
          params: {
            path: ['m', "44'", "60'"],
            curve: 'secp256k1',
            compressed: true,
          },
        }),
      ).toMatchInlineSnapshot(
        `"031e31e8432aab932fe18b5f9798b7252394ff0b943920b40c50a79301062df5ec"`,
      );
    });
  });
});

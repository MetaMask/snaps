import { PermissionType, SubjectType } from '@metamask/permission-controller';
import { SnapCaveatType } from '@metamask/snaps-utils';
import {
  MOCK_SNAP_ID,
  TEST_SECRET_RECOVERY_PHRASE_BYTES,
  TEST_SECRET_RECOVERY_PHRASE_SEED_BYTES,
} from '@metamask/snaps-utils/test-utils';
import { hmac } from '@noble/hashes/hmac';
import { sha512 } from '@noble/hashes/sha512';

import {
  getBip32PublicKeyBuilder,
  getBip32PublicKeyImplementation,
} from './getBip32PublicKey';

describe('specificationBuilder', () => {
  const methodHooks = {
    getMnemonic: jest.fn(),
    getMnemonicSeed: jest.fn(),
    getUnlockPromise: jest.fn(),
    getClientCryptography: jest.fn(),
  };

  const specification = getBip32PublicKeyBuilder.specificationBuilder({
    methodHooks,
  });

  it('outputs expected specification', () => {
    expect(specification).toStrictEqual({
      permissionType: PermissionType.RestrictedMethod,
      targetName: 'snap_getBip32PublicKey',
      allowedCaveats: [SnapCaveatType.PermittedDerivationPaths],
      methodImplementation: expect.any(Function),
      subjectTypes: [SubjectType.Snap],
      validator: expect.any(Function),
    });
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

describe('getBip32PublicKeyImplementation', () => {
  describe('getBip32PublicKey', () => {
    it('derives the public key from the path', async () => {
      const getUnlockPromise = jest.fn().mockResolvedValue(undefined);
      const getMnemonic = jest
        .fn()
        .mockResolvedValue(TEST_SECRET_RECOVERY_PHRASE_BYTES);
      const getMnemonicSeed = jest
        .fn()
        .mockResolvedValue(TEST_SECRET_RECOVERY_PHRASE_SEED_BYTES);
      const getClientCryptography = jest.fn().mockReturnValue({});

      expect(
        await getBip32PublicKeyImplementation({
          getUnlockPromise,
          getMnemonic,
          getMnemonicSeed,
          getClientCryptography,
          // @ts-expect-error Missing other required properties.
        })({
          params: {
            path: ['m', "44'", "1'", "0'", '0', '1'],
            curve: 'secp256k1',
          },
        }),
      ).toMatchInlineSnapshot(
        `"0x0467f3cac111f47782b6c2d8d0984d51e22c128d24ec3eaca044509a386771d17206c740c7337c399d8ade8f52a60029340f288e11de82fffd3b69c5b863f6a515"`,
      );
    });

    it('derives the ed25519 public key from the path', async () => {
      const getUnlockPromise = jest.fn().mockResolvedValue(undefined);
      const getMnemonic = jest
        .fn()
        .mockResolvedValue(TEST_SECRET_RECOVERY_PHRASE_BYTES);
      const getMnemonicSeed = jest
        .fn()
        .mockResolvedValue(TEST_SECRET_RECOVERY_PHRASE_SEED_BYTES);
      const getClientCryptography = jest.fn().mockReturnValue({});

      expect(
        await getBip32PublicKeyImplementation({
          getUnlockPromise,
          getMnemonic,
          getMnemonicSeed,
          getClientCryptography,
          // @ts-expect-error Missing other required properties.
        })({
          params: {
            path: ['m', "44'", "1'", "0'", "0'", "1'"],
            curve: 'ed25519',
          },
        }),
      ).toMatchInlineSnapshot(
        `"0x0012affaf55babdfb59b76adcf00f69442f019974124639108470409d47e25e19f"`,
      );
    });

    it('derives the ed25519Bip32 public key from the path', async () => {
      const getUnlockPromise = jest.fn().mockResolvedValue(undefined);
      const getMnemonic = jest
        .fn()
        .mockResolvedValue(TEST_SECRET_RECOVERY_PHRASE_BYTES);
      const getMnemonicSeed = jest
        .fn()
        .mockResolvedValue(TEST_SECRET_RECOVERY_PHRASE_SEED_BYTES);
      const getClientCryptography = jest.fn().mockReturnValue({});

      expect(
        await getBip32PublicKeyImplementation({
          getUnlockPromise,
          getMnemonic,
          getMnemonicSeed,
          getClientCryptography,
          // @ts-expect-error Missing other required properties.
        })({
          params: {
            path: ['m', "44'", "1'", "0'", "0'", "1'"],
            curve: 'ed25519Bip32',
          },
        }),
      ).toMatchInlineSnapshot(
        `"0xd91d18b4540a2f30341e8463d5f9b25b14fae9a236dcbea338b668a318bb0867"`,
      );
    });

    it('derives the compressed public key from the path', async () => {
      const getUnlockPromise = jest.fn().mockResolvedValue(undefined);
      const getMnemonic = jest
        .fn()
        .mockResolvedValue(TEST_SECRET_RECOVERY_PHRASE_BYTES);
      const getMnemonicSeed = jest
        .fn()
        .mockResolvedValue(TEST_SECRET_RECOVERY_PHRASE_SEED_BYTES);
      const getClientCryptography = jest.fn().mockReturnValue({});

      expect(
        await getBip32PublicKeyImplementation({
          getUnlockPromise,
          getMnemonic,
          getMnemonicSeed,
          getClientCryptography,
          // @ts-expect-error Missing other required properties.
        })({
          params: {
            path: ['m', "44'", "1'", '1', '2', '3'],
            curve: 'secp256k1',
            compressed: true,
          },
        }),
      ).toMatchInlineSnapshot(
        `"0x022de17487a660993177ce2a85bb73b6cd9ad436184d57bdf5a93f5db430bea914"`,
      );
    });

    it('calls `getMnemonic` with a different entropy source', async () => {
      const getMnemonic = jest
        .fn()
        .mockImplementation(() => TEST_SECRET_RECOVERY_PHRASE_BYTES);
      const getMnemonicSeed = jest
        .fn()
        .mockResolvedValue(TEST_SECRET_RECOVERY_PHRASE_SEED_BYTES);

      const getUnlockPromise = jest.fn();
      const getClientCryptography = jest.fn().mockReturnValue({});

      expect(
        await getBip32PublicKeyImplementation({
          getUnlockPromise,
          getMnemonic,
          getMnemonicSeed,
          getClientCryptography,
        })({
          method: 'snap_getBip32PublicKey',
          context: { origin: MOCK_SNAP_ID },
          params: {
            path: ['m', "44'", "1'", '1', '2', '3'],
            curve: 'ed25519Bip32',
            source: 'source-id',
          },
        }),
      ).toMatchInlineSnapshot(
        `"0x03303da49ddfafc90587b7559eacdd5523028e75be81f2a9f158733fee1211a6"`,
      );

      expect(getMnemonic).toHaveBeenCalledWith('source-id');
      expect(getMnemonicSeed).not.toHaveBeenCalled();
    });

    it('calls `getMnemonicSeed` with a different entropy source', async () => {
      const getMnemonic = jest
        .fn()
        .mockImplementation(() => TEST_SECRET_RECOVERY_PHRASE_BYTES);
      const getMnemonicSeed = jest
        .fn()
        .mockResolvedValue(TEST_SECRET_RECOVERY_PHRASE_SEED_BYTES);

      const getUnlockPromise = jest.fn();
      const getClientCryptography = jest.fn().mockReturnValue({});

      expect(
        await getBip32PublicKeyImplementation({
          getUnlockPromise,
          getMnemonic,
          getMnemonicSeed,
          getClientCryptography,
        })({
          method: 'snap_getBip32PublicKey',
          context: { origin: MOCK_SNAP_ID },
          params: {
            path: ['m', "44'", "1'", '1', '2', '3'],
            curve: 'secp256k1',
            source: 'source-id',
          },
        }),
      ).toMatchInlineSnapshot(
        `"0x042de17487a660993177ce2a85bb73b6cd9ad436184d57bdf5a93f5db430bea914f7c31d378fe68f4723b297a04e49ef55fbf490605c4a3f9ca947a4af4f06526a"`,
      );

      expect(getMnemonicSeed).toHaveBeenCalledWith('source-id');
      expect(getMnemonic).not.toHaveBeenCalled();
    });

    it('uses custom client cryptography functions', async () => {
      const getUnlockPromise = jest.fn().mockResolvedValue(undefined);
      const getMnemonic = jest
        .fn()
        .mockResolvedValue(TEST_SECRET_RECOVERY_PHRASE_BYTES);
      const getMnemonicSeed = jest
        .fn()
        .mockResolvedValue(TEST_SECRET_RECOVERY_PHRASE_SEED_BYTES);

      const hmacSha512 = jest
        .fn()
        .mockImplementation((key: Uint8Array, data: Uint8Array) =>
          hmac(sha512, key, data),
        );
      const getClientCryptography = jest.fn().mockReturnValue({
        hmacSha512,
      });

      expect(
        await getBip32PublicKeyImplementation({
          getUnlockPromise,
          getMnemonic,
          getMnemonicSeed,
          getClientCryptography,
          // @ts-expect-error Missing other required properties.
        })({
          params: {
            path: ['m', "44'", "1'", '1', '2', '3'],
            curve: 'secp256k1',
            compressed: true,
          },
        }),
      ).toMatchInlineSnapshot(
        `"0x022de17487a660993177ce2a85bb73b6cd9ad436184d57bdf5a93f5db430bea914"`,
      );

      expect(hmacSha512).toHaveBeenCalledTimes(6);
    });
  });
});

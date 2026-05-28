import type { MockAnyNamespace } from '@metamask/messenger';
import { MOCK_ANY_NAMESPACE, Messenger } from '@metamask/messenger';
import { PermissionType, SubjectType } from '@metamask/permission-controller';
import { SnapCaveatType } from '@metamask/snaps-utils';
import {
  MOCK_SNAP_ID,
  TEST_SECRET_RECOVERY_PHRASE_BYTES,
  TEST_SECRET_RECOVERY_PHRASE_SEED_BYTES,
} from '@metamask/snaps-utils/test-utils';
import { hmac } from '@noble/hashes/hmac';
import { sha512 } from '@noble/hashes/sha512';

import type { GetBip32PublicKeyMessengerActions } from './getBip32PublicKey';
import {
  getBip32PublicKeyBuilder,
  getBip32PublicKeyImplementation,
} from './getBip32PublicKey';

describe('specificationBuilder', () => {
  const methodHooks = {
    getUnlockPromise: jest.fn(),
    getClientCryptography: jest.fn(),
  };

  const specification = getBip32PublicKeyBuilder.specificationBuilder({
    methodHooks,
    messenger: new Messenger({ namespace: 'GetBip32PublicKey' }),
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
  const getMessenger = () => {
    const messenger = new Messenger<
      MockAnyNamespace,
      GetBip32PublicKeyMessengerActions
    >({
      namespace: MOCK_ANY_NAMESPACE,
    });

    messenger.registerActionHandler(
      'KeyringController:withKeyringV2Unsafe',
      async (_selector, operation) =>
        operation({
          keyring: {
            type: 'hd',
            mnemonic: TEST_SECRET_RECOVERY_PHRASE_BYTES,
            seed: TEST_SECRET_RECOVERY_PHRASE_SEED_BYTES,
          },
        }),
    );

    jest.spyOn(messenger, 'call');

    return messenger;
  };

  describe('getBip32PublicKey', () => {
    it('derives the public key from the path', async () => {
      const getUnlockPromise = jest.fn().mockResolvedValue(undefined);
      const getClientCryptography = jest.fn().mockReturnValue({});
      const messenger = getMessenger();

      expect(
        await getBip32PublicKeyImplementation({
          methodHooks: { getUnlockPromise, getClientCryptography },
          messenger,
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
      const getClientCryptography = jest.fn().mockReturnValue({});
      const messenger = getMessenger();

      expect(
        await getBip32PublicKeyImplementation({
          methodHooks: { getUnlockPromise, getClientCryptography },
          messenger,
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
      const getClientCryptography = jest.fn().mockReturnValue({});
      const messenger = getMessenger();

      expect(
        await getBip32PublicKeyImplementation({
          methodHooks: { getUnlockPromise, getClientCryptography },
          messenger,
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
      const getClientCryptography = jest.fn().mockReturnValue({});
      const messenger = getMessenger();

      expect(
        await getBip32PublicKeyImplementation({
          methodHooks: { getUnlockPromise, getClientCryptography },
          messenger,
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

    it('derives the compressed public key from the path using ed25519Bip32', async () => {
      const getUnlockPromise = jest.fn().mockResolvedValue(undefined);
      const getClientCryptography = jest.fn().mockReturnValue({});
      const messenger = getMessenger();

      expect(
        await getBip32PublicKeyImplementation({
          methodHooks: { getUnlockPromise, getClientCryptography },
          messenger,
          // @ts-expect-error Missing other required properties.
        })({
          params: {
            path: ['m', "44'", "1'", '1', '2', '3'],
            curve: 'ed25519Bip32',
            compressed: true,
          },
        }),
      ).toMatchInlineSnapshot(
        `"0x03303da49ddfafc90587b7559eacdd5523028e75be81f2a9f158733fee1211a6"`,
      );
    });

    it('calls `getMnemonic` with a different entropy source', async () => {
      const getUnlockPromise = jest.fn();
      const getClientCryptography = jest.fn().mockReturnValue({});
      const messenger = getMessenger();

      expect(
        await getBip32PublicKeyImplementation({
          methodHooks: { getUnlockPromise, getClientCryptography },
          messenger,
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

      expect(messenger.call).toHaveBeenCalledTimes(1);
      expect(messenger.call).toHaveBeenCalledWith(
        'KeyringController:withKeyringV2Unsafe',
        { id: 'source-id' },
        expect.any(Function),
      );
    });

    it('calls `getMnemonicSeed` with a different entropy source', async () => {
      const getUnlockPromise = jest.fn();
      const getClientCryptography = jest.fn().mockReturnValue({});
      const messenger = getMessenger();

      expect(
        await getBip32PublicKeyImplementation({
          methodHooks: { getUnlockPromise, getClientCryptography },
          messenger,
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

      expect(messenger.call).toHaveBeenCalledTimes(1);
      expect(messenger.call).toHaveBeenCalledWith(
        'KeyringController:withKeyringV2Unsafe',
        { id: 'source-id' },
        expect.any(Function),
      );
    });

    it('uses custom client cryptography functions', async () => {
      const getUnlockPromise = jest.fn().mockResolvedValue(undefined);

      const hmacSha512 = jest
        .fn()
        .mockImplementation((key: Uint8Array, data: Uint8Array) =>
          hmac(sha512, key, data),
        );
      const getClientCryptography = jest.fn().mockReturnValue({
        hmacSha512,
      });
      const messenger = getMessenger();

      expect(
        await getBip32PublicKeyImplementation({
          methodHooks: { getUnlockPromise, getClientCryptography },
          messenger,
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

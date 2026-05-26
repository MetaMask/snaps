import type { MockAnyNamespace } from '@metamask/messenger';
import { MOCK_ANY_NAMESPACE, Messenger } from '@metamask/messenger';
import { SubjectType, PermissionType } from '@metamask/permission-controller';
import { SnapCaveatType } from '@metamask/snaps-utils';
import {
  MOCK_SNAP_ID,
  TEST_SECRET_RECOVERY_PHRASE_SEED_BYTES,
} from '@metamask/snaps-utils/test-utils';
import { hmac } from '@noble/hashes/hmac';
import { sha512 } from '@noble/hashes/sha512';

import type { GetBip44EntropyMessengerActions } from './getBip44Entropy';
import {
  getBip44EntropyBuilder,
  getBip44EntropyImplementation,
} from './getBip44Entropy';

describe('specificationBuilder', () => {
  const methodHooks = {
    getUnlockPromise: jest.fn(),
    getClientCryptography: jest.fn(),
  };

  const specification = getBip44EntropyBuilder.specificationBuilder({
    methodHooks,
    messenger: new Messenger({ namespace: 'GetBip44Entropy' }),
  });

  it('outputs expected specification', () => {
    expect(specification).toStrictEqual({
      permissionType: PermissionType.RestrictedMethod,
      targetName: 'snap_getBip44Entropy',
      allowedCaveats: [SnapCaveatType.PermittedCoinTypes],
      methodImplementation: expect.any(Function),
      subjectTypes: [SubjectType.Snap],
      validator: expect.any(Function),
    });
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

describe('getBip44EntropyImplementation', () => {
  const getMessenger = () => {
    const messenger = new Messenger<
      MockAnyNamespace,
      GetBip44EntropyMessengerActions
    >({
      namespace: MOCK_ANY_NAMESPACE,
    });

    messenger.registerActionHandler(
      'KeyringController:withKeyringV2',
      async (_selector, operation) =>
        operation({
          keyring: {
            type: 'HD Key Tree',
            seed: TEST_SECRET_RECOVERY_PHRASE_SEED_BYTES,
          },
        }),
    );

    jest.spyOn(messenger, 'call');

    return messenger;
  };

  describe('getBip44Entropy', () => {
    it('derives the entropy from the path', async () => {
      const getUnlockPromise = jest.fn().mockResolvedValue(undefined);
      const getClientCryptography = jest.fn().mockReturnValue({});
      const messenger = getMessenger();

      expect(
        await getBip44EntropyImplementation({
          methodHooks: { getUnlockPromise, getClientCryptography },
          messenger,
          // @ts-expect-error Missing other required properties.
        })({
          params: { coinType: 1 },
        }),
      ).toMatchInlineSnapshot(`
        {
          "chainCode": "0x50ccfa58a885b48b5eed09486b3948e8454f34856fb81da5d7b8519d7997abd1",
          "coin_type": 1,
          "depth": 2,
          "index": 2147483649,
          "masterFingerprint": 1404659567,
          "network": "mainnet",
          "parentFingerprint": 1829122711,
          "path": "m / bip32:44' / bip32:1'",
          "privateKey": "0xc73cedb996e7294f032766853a8b7ba11ab4ce9755fc052f2f7b9000044c99af",
          "publicKey": "0x048e129862c1de5ca86468add43b001d32fd34b8113de716ecd63fa355b7f1165f0e76f5dc6095100f9fdaa76ddf28aa3f21406ac5fda7c71ffbedb45634fe2ceb",
        }
      `);
    });

    it('calls `getMnemonic` with a different entropy source', async () => {
      const getUnlockPromise = jest.fn();
      const getClientCryptography = jest.fn().mockReturnValue({});
      const messenger = getMessenger();

      expect(
        await getBip44EntropyImplementation({
          methodHooks: { getUnlockPromise, getClientCryptography },
          messenger,
        })({
          method: 'snap_getBip44Entropy',
          context: { origin: MOCK_SNAP_ID },
          params: { coinType: 1, source: 'source-id' },
        }),
      ).toMatchInlineSnapshot(`
        {
          "chainCode": "0x50ccfa58a885b48b5eed09486b3948e8454f34856fb81da5d7b8519d7997abd1",
          "coin_type": 1,
          "depth": 2,
          "index": 2147483649,
          "masterFingerprint": 1404659567,
          "network": "mainnet",
          "parentFingerprint": 1829122711,
          "path": "m / bip32:44' / bip32:1'",
          "privateKey": "0xc73cedb996e7294f032766853a8b7ba11ab4ce9755fc052f2f7b9000044c99af",
          "publicKey": "0x048e129862c1de5ca86468add43b001d32fd34b8113de716ecd63fa355b7f1165f0e76f5dc6095100f9fdaa76ddf28aa3f21406ac5fda7c71ffbedb45634fe2ceb",
        }
      `);

      expect(messenger.call).toHaveBeenCalledTimes(1);
      expect(messenger.call).toHaveBeenCalledWith(
        'KeyringController:withKeyringV2',
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
        await getBip44EntropyImplementation({
          methodHooks: { getUnlockPromise, getClientCryptography },
          messenger,
          // @ts-expect-error Missing other required properties.
        })({
          params: { coinType: 1 },
        }),
      ).toMatchInlineSnapshot(`
        {
          "chainCode": "0x50ccfa58a885b48b5eed09486b3948e8454f34856fb81da5d7b8519d7997abd1",
          "coin_type": 1,
          "depth": 2,
          "index": 2147483649,
          "masterFingerprint": 1404659567,
          "network": "mainnet",
          "parentFingerprint": 1829122711,
          "path": "m / bip32:44' / bip32:1'",
          "privateKey": "0xc73cedb996e7294f032766853a8b7ba11ab4ce9755fc052f2f7b9000044c99af",
          "publicKey": "0x048e129862c1de5ca86468add43b001d32fd34b8113de716ecd63fa355b7f1165f0e76f5dc6095100f9fdaa76ddf28aa3f21406ac5fda7c71ffbedb45634fe2ceb",
        }
      `);

      expect(hmacSha512).toHaveBeenCalledTimes(3);
    });
  });
});

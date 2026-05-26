import type { MockAnyNamespace } from '@metamask/messenger';
import { MOCK_ANY_NAMESPACE, Messenger } from '@metamask/messenger';
import { PermissionType, SubjectType } from '@metamask/permission-controller';
import {
  MOCK_SNAP_ID,
  TEST_SECRET_RECOVERY_PHRASE_SEED_BYTES,
} from '@metamask/snaps-utils/test-utils';
import { hmac } from '@noble/hashes/hmac';
import { sha512 } from '@noble/hashes/sha512';

import type { GetEntropyMessengerActions } from './getEntropy';
import { getEntropyBuilder } from './getEntropy';

describe('getEntropyBuilder', () => {
  it('has the expected shape', () => {
    expect(getEntropyBuilder).toStrictEqual({
      targetName: 'snap_getEntropy',
      specificationBuilder: expect.any(Function),
      methodHooks: {
        getUnlockPromise: true,
        getClientCryptography: true,
      },
      actionNames: ['KeyringController:withKeyringV2Unsafe'],
    });
  });

  it('returns the expected specification', () => {
    const methodHooks = {
      getUnlockPromise: jest.fn(),
      getClientCryptography: jest.fn(),
    };

    expect(
      getEntropyBuilder.specificationBuilder({
        methodHooks,
        messenger: new Messenger({ namespace: 'GetEntropy' }),
      }),
    ).toStrictEqual({
      permissionType: PermissionType.RestrictedMethod,
      targetName: 'snap_getEntropy',
      allowedCaveats: null,
      methodImplementation: expect.any(Function),
      subjectTypes: [SubjectType.Snap],
    });
  });
});

describe('getEntropyImplementation', () => {
  const getMessenger = () => {
    const messenger = new Messenger<
      MockAnyNamespace,
      GetEntropyMessengerActions
    >({
      namespace: MOCK_ANY_NAMESPACE,
    });

    messenger.registerActionHandler(
      'KeyringController:withKeyringV2Unsafe',
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

  it('returns the expected result', async () => {
    const getUnlockPromise = jest.fn();
    const getClientCryptography = jest.fn().mockReturnValue({});

    const methodHooks = {
      getUnlockPromise,
      getClientCryptography,
    };
    const messenger = getMessenger();

    const implementation = getEntropyBuilder.specificationBuilder({
      methodHooks,
      messenger,
    }).methodImplementation;

    const result = await implementation({
      method: 'snap_getEntropy',
      params: {
        version: 1,
        salt: 'foo',
      },
      context: {
        origin: MOCK_SNAP_ID,
      },
    });

    expect(result).toBe(
      '0x6d8e92de419401c7da3cedd5f60ce5635b26059c2a4a8003877fec83653a4921',
    );
  });

  it('calls `getMnemonic` with a different entropy source', async () => {
    const getUnlockPromise = jest.fn();
    const getClientCryptography = jest.fn().mockReturnValue({});

    const methodHooks = {
      getUnlockPromise,
      getClientCryptography,
    };
    const messenger = getMessenger();

    const implementation = getEntropyBuilder.specificationBuilder({
      methodHooks,
      messenger,
    }).methodImplementation;

    const result = await implementation({
      method: 'snap_getEntropy',
      params: {
        version: 1,
        salt: 'foo',
        source: 'source-id',
      },
      context: {
        origin: MOCK_SNAP_ID,
      },
    });

    expect(result).toBe(
      '0x6d8e92de419401c7da3cedd5f60ce5635b26059c2a4a8003877fec83653a4921',
    );

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

    const methodHooks = {
      getUnlockPromise,
      getClientCryptography,
    };
    const messenger = getMessenger();

    const implementation = getEntropyBuilder.specificationBuilder({
      methodHooks,
      messenger,
    }).methodImplementation;

    const result = await implementation({
      method: 'snap_getEntropy',
      params: {
        version: 1,
        salt: 'foo',
      },
      context: {
        origin: MOCK_SNAP_ID,
      },
    });

    expect(result).toBe(
      '0x6d8e92de419401c7da3cedd5f60ce5635b26059c2a4a8003877fec83653a4921',
    );

    expect(hmacSha512).toHaveBeenCalledTimes(10);
  });
});

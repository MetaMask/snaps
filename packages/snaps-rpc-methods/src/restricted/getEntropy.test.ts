import type { MockAnyNamespace } from '@metamask/messenger';
import { MOCK_ANY_NAMESPACE, Messenger } from '@metamask/messenger';
import { PermissionType, SubjectType } from '@metamask/permission-controller';
import {
  MOCK_SNAP_ID,
  TEST_SECRET_RECOVERY_PHRASE_SEED_BYTES,
} from '@metamask/snaps-utils/test-utils';

import type { GetEntropyMessengerActions } from './getEntropy';
import { getEntropyBuilder } from './getEntropy';

describe('getEntropyBuilder', () => {
  it('has the expected shape', () => {
    expect(getEntropyBuilder).toStrictEqual({
      targetName: 'snap_getEntropy',
      specificationBuilder: expect.any(Function),
      methodHooks: {
        getUnlockPromise: true,
      },
      actionNames: ['KeyringController:withKeyringV2Unsafe'],
    });
  });

  it('returns the expected specification', () => {
    const methodHooks = {
      getUnlockPromise: jest.fn(),
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
            type: 'hd',
            seed: TEST_SECRET_RECOVERY_PHRASE_SEED_BYTES,
          },
        }),
    );

    jest.spyOn(messenger, 'call');

    return messenger;
  };

  it('returns the expected result', async () => {
    const getUnlockPromise = jest.fn();
    const methodHooks = {
      getUnlockPromise,
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
    const methodHooks = {
      getUnlockPromise,
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
});

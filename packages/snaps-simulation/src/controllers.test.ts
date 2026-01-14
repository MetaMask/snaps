import { Caip25EndowmentPermissionName } from '@metamask/chain-agnostic-permission';
import { mnemonicPhraseToBytes } from '@metamask/key-tree';
import { Messenger } from '@metamask/messenger';
import {
  PermissionController,
  SubjectMetadataController,
} from '@metamask/permission-controller';
import { MOCK_SNAP_ID } from '@metamask/snaps-utils/test-utils';

import { DEFAULT_SRP } from './constants';
import { getControllers } from './controllers';
import { MOCK_CAVEAT } from './middleware/multichain/test-utils';
import type { RestrictedMiddlewareHooks } from './simulation';
import { getMockOptions } from './test-utils';

describe('getControllers', () => {
  it('returns the controllers', async () => {
    const MOCK_HOOKS: RestrictedMiddlewareHooks = {
      getIsLocked: jest.fn(),
      getMnemonic: jest
        .fn()
        .mockResolvedValue(mnemonicPhraseToBytes(DEFAULT_SRP)),
      getClientCryptography: jest.fn(),
      getMnemonicSeed: jest.fn(),
      getSimulationState: jest.fn(),
      getSnap: jest.fn(),
      setCurrentChain: jest.fn(),
    };

    const { permissionController, subjectMetadataController } =
      await getControllers({
        controllerMessenger: new Messenger({ namespace: 'Root' }),
        hooks: MOCK_HOOKS,
        runSaga: jest.fn(),
        options: getMockOptions(),
      });

    expect(permissionController).toBeInstanceOf(PermissionController);
    expect(subjectMetadataController).toBeInstanceOf(SubjectMetadataController);
  });

  describe('PermissionController', () => {
    it('can grant the CAIP-25 endowment', async () => {
      const MOCK_HOOKS: RestrictedMiddlewareHooks = {
        getIsLocked: jest.fn(),
        getMnemonic: jest
          .fn()
          .mockResolvedValue(mnemonicPhraseToBytes(DEFAULT_SRP)),
        getClientCryptography: jest.fn(),
        getMnemonicSeed: jest.fn(),
        getSimulationState: jest.fn(),
        getSnap: jest.fn(),
        setCurrentChain: jest.fn(),
      };

      const { permissionController } = await getControllers({
        controllerMessenger: new Messenger({ namespace: 'Root' }),
        hooks: MOCK_HOOKS,
        runSaga: jest.fn(),
        options: getMockOptions(),
      });

      expect(
        permissionController.grantPermissions({
          approvedPermissions: {
            [Caip25EndowmentPermissionName]: {
              caveats: [MOCK_CAVEAT],
            },
          },
          subject: { origin: MOCK_SNAP_ID },
        }),
      ).toStrictEqual({
        [Caip25EndowmentPermissionName]: expect.objectContaining({
          caveats: [MOCK_CAVEAT],
        }),
      });
    });

    it('throws when granting CAIP-25 endowment with non-EVM addresses', async () => {
      const MOCK_HOOKS: RestrictedMiddlewareHooks = {
        getIsLocked: jest.fn(),
        getMnemonic: jest
          .fn()
          .mockResolvedValue(mnemonicPhraseToBytes(DEFAULT_SRP)),
        getClientCryptography: jest.fn(),
        getMnemonicSeed: jest.fn(),
        getSimulationState: jest.fn(),
        getSnap: jest.fn(),
        setCurrentChain: jest.fn(),
      };

      const { permissionController } = await getControllers({
        controllerMessenger: new Messenger({ namespace: 'Root' }),
        hooks: MOCK_HOOKS,
        runSaga: jest.fn(),
        options: getMockOptions(),
      });

      const caveat = {
        ...MOCK_CAVEAT,
        value: {
          ...MOCK_CAVEAT.value,
          requiredScopes: {
            'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp': {
              methods: ['signMessage', 'getGenesisHash'],
              notifications: [],
              accounts: [
                'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp:7S3P4HxJpyyigGzodYwHtCxZyUQe9JiBMHyRWXArAaKv',
              ],
            },
          },
        },
      };

      expect(() =>
        permissionController.grantPermissions({
          approvedPermissions: {
            [Caip25EndowmentPermissionName]: {
              caveats: [caveat],
            },
          },
          subject: { origin: MOCK_SNAP_ID },
        }),
      ).toThrow(
        'endowment:caip25 error: Received account value(s) for caveat of type "authorizedScopes" that are not supported by the wallet.',
      );
    });
  });
});

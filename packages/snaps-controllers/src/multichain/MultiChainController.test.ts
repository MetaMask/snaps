/* eslint-disable jest/prefer-strict-equal */

import { WALLET_SNAP_PERMISSION_KEY } from '@metamask/rpc-methods';
import { getSnapChecksum } from '@metamask/snaps-utils';
import {
  MOCK_ORIGIN,
  MOCK_SNAP_ID,
  getSnapManifest,
  getPersistedSnapObject,
  getSnapFiles,
} from '@metamask/snaps-utils/test-utils';
import { assert } from '@metamask/utils';

import { SnapEndowments } from '../snaps';
import {
  MOCK_CONNECT_ARGUMENTS,
  getMultiChainControllerWithEES,
  MOCK_KEYRING_PERMISSION,
  MOCK_EIP155_NAMESPACE_REQUEST,
  PERSISTED_MOCK_KEYRING_SNAP,
  getSnapControllerWithEESOptions,
  getPersistedSnapsState,
} from '../test-utils';

describe('MultiChainController', () => {
  describe('onConnect', () => {
    it('handles the handshake', async () => {
      const {
        rootMessenger,
        multiChainController,
        snapController,
        executionService,
      } = getMultiChainControllerWithEES({
        snapControllerOptions: getSnapControllerWithEESOptions({
          state: {
            snaps: getPersistedSnapsState(PERSISTED_MOCK_KEYRING_SNAP),
          },
        }),
      });

      const snap = snapController.getExpect(MOCK_SNAP_ID);
      await snapController.startSnap(snap.id);

      const result = await multiChainController.onConnect(
        MOCK_ORIGIN,
        MOCK_CONNECT_ARGUMENTS,
      );
      expect(result).toEqual({
        namespaces: {
          eip155: {
            ...MOCK_EIP155_NAMESPACE_REQUEST,
            accounts: ['eip155:1:foo'],
          },
        },
      });
      expect(rootMessenger.call).toHaveBeenCalledTimes(10);

      snapController.destroy();
      await executionService.terminateAllSnaps();
    });

    it('closes an existing session', async () => {
      const {
        multiChainController,
        rootMessenger,
        snapController,
        executionService,
      } = getMultiChainControllerWithEES({
        snapControllerOptions: getSnapControllerWithEESOptions({
          state: {
            snaps: getPersistedSnapsState(PERSISTED_MOCK_KEYRING_SNAP),
          },
        }),
      });

      const snap = snapController.getExpect(MOCK_SNAP_ID);
      await snapController.startSnap(snap.id);

      await multiChainController.onConnect(MOCK_ORIGIN, MOCK_CONNECT_ARGUMENTS);

      // Create a new session
      const result = await multiChainController.onConnect(
        MOCK_ORIGIN,
        MOCK_CONNECT_ARGUMENTS,
      );
      expect(result).toEqual({
        namespaces: {
          eip155: {
            ...MOCK_EIP155_NAMESPACE_REQUEST,
            accounts: ['eip155:1:foo'],
          },
        },
      });

      expect(rootMessenger.call).toHaveBeenCalledWith(
        'SnapController:decrementActiveReferences',
        MOCK_SNAP_ID,
      );

      expect(rootMessenger.call).toHaveBeenCalledTimes(19);

      snapController.destroy();
      await executionService.terminateAllSnaps();
    });

    it('prefers existing approved snaps', async () => {
      // This test works by using different mocks for the messenger than the other tests.
      const {
        multiChainController,
        rootMessenger,
        snapController,
        executionService,
      } = getMultiChainControllerWithEES({
        snapControllerOptions: getSnapControllerWithEESOptions({
          state: {
            snaps: getPersistedSnapsState(PERSISTED_MOCK_KEYRING_SNAP),
          },
        }),
      });

      const snap = snapController.getExpect(MOCK_SNAP_ID);
      await snapController.startSnap(snap.id);

      rootMessenger.registerActionHandler(
        'PermissionController:getPermissions',
        // @ts-expect-error - Invalid permission type.
        (subject) => {
          if (subject === MOCK_SNAP_ID) {
            return { [SnapEndowments.Keyring]: MOCK_KEYRING_PERMISSION };
          }

          if (subject === MOCK_ORIGIN) {
            return { [WALLET_SNAP_PERMISSION_KEY]: { [MOCK_SNAP_ID]: {} } };
          }

          return {};
        },
      );

      const result = await multiChainController.onConnect(
        MOCK_ORIGIN,
        MOCK_CONNECT_ARGUMENTS,
      );

      expect(result).toEqual({
        namespaces: {
          eip155: {
            ...MOCK_EIP155_NAMESPACE_REQUEST,
            accounts: ['eip155:1:foo'],
          },
        },
      });

      expect(rootMessenger.call).toHaveBeenCalledTimes(12);

      snapController.destroy();
      await executionService.terminateAllSnaps();
    });

    it('prompts in case of multiple previously approved snaps', async () => {
      const secondSnapId = 'npm:@metamask/example-snap2';
      const secondSnapSourceCode = `
      class Keyring {
        async getAccounts() {
          return ['eip155:1:bar'];
        }
      }
      module.exports.keyring = new Keyring();`;

      const {
        multiChainController,
        rootMessenger,
        snapController,
        executionService,
      } = getMultiChainControllerWithEES({
        snapControllerOptions: getSnapControllerWithEESOptions({
          state: {
            snaps: getPersistedSnapsState(
              PERSISTED_MOCK_KEYRING_SNAP,
              getPersistedSnapObject({
                ...PERSISTED_MOCK_KEYRING_SNAP,
                id: secondSnapId,
                sourceCode: secondSnapSourceCode,
                manifest: getSnapManifest({
                  shasum: getSnapChecksum(
                    getSnapFiles({ sourceCode: secondSnapSourceCode }),
                  ),
                  initialPermissions:
                    PERSISTED_MOCK_KEYRING_SNAP.manifest.initialPermissions,
                }),
              }),
            ),
          },
        }),
      });

      const snap = snapController.getExpect(MOCK_SNAP_ID);
      await snapController.startSnap(snap.id);

      const snap2 = snapController.getExpect(secondSnapId);
      await snapController.startSnap(snap2.id);

      rootMessenger.registerActionHandler(
        'PermissionController:getPermissions',
        // @ts-expect-error - Invalid permission type.
        (subject) => {
          if (subject === snap.id || subject === snap2.id) {
            return { [SnapEndowments.Keyring]: MOCK_KEYRING_PERMISSION };
          }

          if (subject === MOCK_ORIGIN) {
            return {
              [WALLET_SNAP_PERMISSION_KEY]: {
                [snap.id]: {},
                [snap2.id]: {},
              },
            };
          }

          return {};
        },
      );

      rootMessenger.registerActionHandler(
        'ApprovalController:addRequest',
        async ({ type, requestData }) => {
          if (type === 'multichain_connect') {
            assert(requestData?.possibleAccounts);

            return Promise.resolve(
              Object.fromEntries(
                Object.entries(requestData.possibleAccounts).map(
                  ([namespace, snapAndAccounts]) => [
                    namespace,
                    (snapAndAccounts as string[])[1] ?? null,
                  ],
                ),
              ),
            );
          }

          return Promise.resolve({});
        },
      );

      const result = await multiChainController.onConnect(
        MOCK_ORIGIN,
        MOCK_CONNECT_ARGUMENTS,
      );

      expect(result).toEqual({
        namespaces: {
          eip155: {
            ...MOCK_EIP155_NAMESPACE_REQUEST,
            accounts: ['eip155:1:bar'],
          },
        },
      });

      expect(rootMessenger.call).toHaveBeenCalledTimes(19);
      expect(rootMessenger.call).toHaveBeenNthCalledWith(
        17,
        'ApprovalController:addRequest',
        {
          id: expect.any(String),
          origin: MOCK_ORIGIN,
          type: 'multichain_connect',
          requestData: {
            possibleAccounts: {
              eip155: [
                { snapId: snap.id, accounts: ['eip155:1:foo'] },
                { snapId: snap2.id, accounts: ['eip155:1:bar'] },
              ],
              bip122: [],
            },
          },
        },
        true,
      );

      snapController.destroy();
      await executionService.terminateAllSnaps();
    });

    // This test works by using different mocks for the messenger than the other tests.
    it('ignores errors thrown by snaps getAccounts', async () => {
      const sourceCode = `
      class Keyring {
        async getAccounts() {
          throw new Error('foo bar');
        }
      }
      module.exports.keyring = new Keyring();`;

      const {
        multiChainController,
        rootMessenger,
        snapController,
        executionService,
      } = getMultiChainControllerWithEES({
        snapControllerOptions: getSnapControllerWithEESOptions({
          state: {
            snaps: getPersistedSnapsState(
              getPersistedSnapObject({
                ...PERSISTED_MOCK_KEYRING_SNAP,
                sourceCode,
                manifest: getSnapManifest({
                  shasum: getSnapChecksum(getSnapFiles({ sourceCode })),
                  initialPermissions:
                    PERSISTED_MOCK_KEYRING_SNAP.manifest.initialPermissions,
                }),
              }),
            ),
          },
        }),
      });

      const snap = snapController.getExpect(MOCK_SNAP_ID);
      await snapController.startSnap(snap.id);

      rootMessenger.registerActionHandler(
        'ApprovalController:addRequest',
        async () => Promise.resolve({}),
      );

      await expect(
        multiChainController.onConnect(MOCK_ORIGIN, MOCK_CONNECT_ARGUMENTS),
      ).rejects.toThrow(
        'No installed snaps found for any requested namespace.',
      );
      expect(rootMessenger.call).toHaveBeenCalledTimes(10);

      snapController.destroy();
      await executionService.terminateAllSnaps();
    });
  });

  describe('onRequest', () => {
    it('handles the routing', async () => {
      const {
        multiChainController,
        rootMessenger,
        snapController,
        executionService,
      } = getMultiChainControllerWithEES({
        snapControllerOptions: getSnapControllerWithEESOptions({
          state: {
            snaps: getPersistedSnapsState(PERSISTED_MOCK_KEYRING_SNAP),
          },
        }),
      });

      const snap = snapController.getExpect(MOCK_SNAP_ID);
      await snapController.startSnap(snap.id);

      await multiChainController.onConnect(MOCK_ORIGIN, MOCK_CONNECT_ARGUMENTS);

      const result = await multiChainController.onRequest(MOCK_ORIGIN, {
        chainId: 'eip155:1',
        request: { method: 'eth_accounts', params: [] },
      });

      expect(result).toEqual(['eip155:1:foo']);
      expect(rootMessenger.call).toHaveBeenCalledTimes(15);

      snapController.destroy();
      await executionService.terminateAllSnaps();
    });
  });
});

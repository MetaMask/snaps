/* eslint-disable jest/prefer-strict-equal */
import {
  fromEntries,
  getSnapPermissionName,
  getSnapSourceShasum,
} from '@metamask/snap-utils';
import {
  MOCK_ORIGIN,
  MOCK_SNAP_ID,
  getSnapManifest,
} from '@metamask/snap-utils/test-utils';
import { SnapEndowments } from '../snaps';
import {
  MOCK_CONNECT_ARGUMENTS,
  getMultiChainControllerWithEES,
  MOCK_KEYRING_SNAP,
  MOCK_KEYRING_PERMISSION,
  MOCK_EIP155_NAMESPACE_REQUEST,
} from '../test-utils';

describe('MultiChainController', () => {
  describe('onConnect', () => {
    it('handles the handshake', async () => {
      const {
        multiChainController,
        multiChainControllerMessenger,
        snapController,
        executionService,
      } = getMultiChainControllerWithEES();

      const snap = await snapController.add(MOCK_KEYRING_SNAP);
      await snapController.startSnap(snap.id);

      const originalCall = multiChainControllerMessenger.call.bind(
        multiChainControllerMessenger,
      );

      const messengerCallMock = jest
        .spyOn(multiChainControllerMessenger, 'call')
        .mockImplementation((method, ...args) => {
          if (
            method === 'PermissionController:getPermissions' &&
            args[0] === MOCK_SNAP_ID
          ) {
            return { [SnapEndowments.Keyring]: MOCK_KEYRING_PERMISSION } as any;
          }
          const approvalRequest = args[0] as any;
          if (
            method === 'ApprovalController:addRequest' &&
            approvalRequest?.type === 'multichain_connect'
          ) {
            return fromEntries(
              Object.entries(
                approvalRequest?.requestData?.possibleAccounts,
              ).map(([namespace, snapAndAccounts]) => [
                namespace,
                (snapAndAccounts as string[])[0] ?? null,
              ]),
            ) as any;
          } else if (
            method === 'PermissionController:getPermissions' ||
            method === 'ApprovalController:addRequest'
          ) {
            return {};
          } else if (method === 'PermissionController:grantPermissions') {
            return true;
          }
          return originalCall(method, ...args);
        });

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
      expect(messengerCallMock).toHaveBeenCalledTimes(7);

      snapController.destroy();
      await executionService.terminateAllSnaps();
    });

    it('closes an existing session', async () => {
      const {
        multiChainController,
        multiChainControllerMessenger,
        snapController,
        executionService,
      } = getMultiChainControllerWithEES();

      const snap = await snapController.add(MOCK_KEYRING_SNAP);
      await snapController.startSnap(snap.id);

      const originalCall = multiChainControllerMessenger.call.bind(
        multiChainControllerMessenger,
      );

      const messengerCallMock = jest
        .spyOn(multiChainControllerMessenger, 'call')
        .mockImplementation((method, ...args) => {
          if (
            method === 'PermissionController:getPermissions' &&
            args[0] === MOCK_SNAP_ID
          ) {
            return { [SnapEndowments.Keyring]: MOCK_KEYRING_PERMISSION } as any;
          }
          const approvalRequest = args[0] as any;
          if (
            method === 'ApprovalController:addRequest' &&
            approvalRequest?.type === 'multichain_connect'
          ) {
            return fromEntries(
              Object.entries(
                approvalRequest?.requestData?.possibleAccounts,
              ).map(([namespace, snapAndAccounts]) => [
                namespace,
                (snapAndAccounts as string[])[0] ?? null,
              ]),
            ) as any;
          } else if (
            method === 'PermissionController:getPermissions' ||
            method === 'ApprovalController:addRequest'
          ) {
            return {};
          } else if (method === 'PermissionController:grantPermissions') {
            return true;
          }
          return originalCall(method, ...args);
        });

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

      expect(messengerCallMock).toHaveBeenCalledWith(
        'SnapController:decrementActiveReferences',
        MOCK_SNAP_ID,
      );

      expect(messengerCallMock).toHaveBeenCalledTimes(15);

      snapController.destroy();
      await executionService.terminateAllSnaps();
    });

    it('prefers existing approved snaps', async () => {
      // This test works by using different mocks for the messenger than the other tests.
      const {
        multiChainController,
        multiChainControllerMessenger,
        snapController,
        executionService,
      } = getMultiChainControllerWithEES();

      const snap = await snapController.add(MOCK_KEYRING_SNAP);
      await snapController.startSnap(snap.id);

      const originalCall = multiChainControllerMessenger.call.bind(
        multiChainControllerMessenger,
      );

      const messengerCallMock = jest
        .spyOn(multiChainControllerMessenger, 'call')
        .mockImplementation((method, ...args) => {
          if (
            method === 'PermissionController:getPermissions' &&
            args[0] === MOCK_SNAP_ID
          ) {
            return { [SnapEndowments.Keyring]: MOCK_KEYRING_PERMISSION } as any;
          } else if (
            method === 'PermissionController:getPermissions' &&
            args[0] === MOCK_ORIGIN
          ) {
            // Return existing connection to the keyring snap
            return { [getSnapPermissionName(MOCK_SNAP_ID)]: {} } as any;
          } else if (
            method === 'PermissionController:getPermissions' ||
            method === 'ApprovalController:addRequest'
          ) {
            return {};
          }
          return originalCall(method, ...args);
        });

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

      expect(messengerCallMock).toHaveBeenCalledTimes(5);

      snapController.destroy();
      await executionService.terminateAllSnaps();
    });

    it('prompts in case of multiple previously approved snaps', async () => {
      const {
        multiChainController,
        multiChainControllerMessenger,
        snapController,
        executionService,
      } = getMultiChainControllerWithEES();

      const snap = await snapController.add(MOCK_KEYRING_SNAP);
      await snapController.startSnap(snap.id);

      const bundle = `
      class Keyring {
        async getAccounts() {
          return ['eip155:1:bar'];
        }
      }
      module.exports.keyring = new Keyring();`;

      const snap2 = await snapController.add({
        ...MOCK_KEYRING_SNAP,
        id: 'npm:@metamask/example-snap2',
        sourceCode: bundle,
        manifest: getSnapManifest({
          shasum: getSnapSourceShasum(bundle),
          initialPermissions: MOCK_KEYRING_SNAP.manifest.initialPermissions,
        }),
      });
      await snapController.startSnap(snap2.id);

      const originalCall = multiChainControllerMessenger.call.bind(
        multiChainControllerMessenger,
      );

      const messengerCallMock = jest
        .spyOn(multiChainControllerMessenger, 'call')
        .mockImplementation((method, ...args) => {
          if (
            method === 'PermissionController:getPermissions' &&
            (args[0] === snap.id || args[0] === snap2.id)
          ) {
            return { [SnapEndowments.Keyring]: MOCK_KEYRING_PERMISSION } as any;
          }
          const approvalRequest = args[0] as any;
          if (
            method === 'ApprovalController:addRequest' &&
            approvalRequest?.type === 'multichain_connect'
          ) {
            // Choose second snap
            return fromEntries(
              Object.entries(
                approvalRequest?.requestData?.possibleAccounts,
              ).map(([namespace, snapAndAccounts]) => [
                namespace,
                (snapAndAccounts as string[])[1] ?? null,
              ]),
            ) as any;
          } else if (
            method === 'PermissionController:getPermissions' &&
            args[0] === MOCK_ORIGIN
          ) {
            // Return existing connection to the keyring snap
            return {
              [getSnapPermissionName(snap.id)]: {},
              [getSnapPermissionName(snap2.id)]: {},
            } as any;
          } else if (
            method === 'PermissionController:getPermissions' ||
            method === 'ApprovalController:addRequest'
          ) {
            return {};
          } else if (method === 'PermissionController:grantPermissions') {
            return true;
          }
          return originalCall(method, ...args);
        });

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

      expect(messengerCallMock).toHaveBeenCalledTimes(9);

      expect(messengerCallMock).toHaveBeenNthCalledWith(
        7,
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

    it('ignores errors thrown by snaps getAccounts', async () => {
      // This test works by using different mocks for the messenger than the other tests.
      const {
        multiChainController,
        multiChainControllerMessenger,
        snapController,
        executionService,
      } = getMultiChainControllerWithEES();

      const bundle = `
      class Keyring {
        async getAccounts() {
          throw new Error('foo bar');
        }
      }
      module.exports.keyring = new Keyring();`;

      const snap = await snapController.add({
        ...MOCK_KEYRING_SNAP,
        sourceCode: bundle,
        manifest: getSnapManifest({
          shasum: getSnapSourceShasum(bundle),
          initialPermissions: MOCK_KEYRING_SNAP.manifest.initialPermissions,
        }),
      });
      await snapController.startSnap(snap.id);

      const originalCall = multiChainControllerMessenger.call.bind(
        multiChainControllerMessenger,
      );

      const messengerCallMock = jest
        .spyOn(multiChainControllerMessenger, 'call')
        .mockImplementation((method, ...args) => {
          if (
            method === 'PermissionController:getPermissions' &&
            args[0] === MOCK_SNAP_ID
          ) {
            return { [SnapEndowments.Keyring]: MOCK_KEYRING_PERMISSION } as any;
          } else if (
            method === 'PermissionController:getPermissions' ||
            method === 'ApprovalController:addRequest'
          ) {
            return {};
          }
          return originalCall(method, ...args);
        });

      await expect(
        multiChainController.onConnect(MOCK_ORIGIN, MOCK_CONNECT_ARGUMENTS),
      ).rejects.toThrow(
        'No installed snaps found for any requested namespace.',
      );
      expect(messengerCallMock).toHaveBeenCalledTimes(4);

      snapController.destroy();
      await executionService.terminateAllSnaps();
    });
  });

  describe('onRequest', () => {
    it('handles the routing', async () => {
      const {
        multiChainController,
        multiChainControllerMessenger,
        snapController,
        executionService,
      } = getMultiChainControllerWithEES();

      const snap = await snapController.add(MOCK_KEYRING_SNAP);
      await snapController.startSnap(snap.id);

      const originalCall = multiChainControllerMessenger.call.bind(
        multiChainControllerMessenger,
      );

      const messengerCallMock = jest
        .spyOn(multiChainControllerMessenger, 'call')
        .mockImplementation((method, ...args) => {
          if (
            method === 'PermissionController:getPermissions' &&
            args[0] === MOCK_SNAP_ID
          ) {
            return { [SnapEndowments.Keyring]: MOCK_KEYRING_PERMISSION } as any;
          }
          const approvalRequest = args[0] as any;
          if (
            method === 'ApprovalController:addRequest' &&
            approvalRequest?.type === 'multichain_connect'
          ) {
            return fromEntries(
              Object.entries(
                approvalRequest?.requestData?.possibleAccounts,
              ).map(([namespace, snapAndAccounts]) => [
                namespace,
                (snapAndAccounts as string[])[0] ?? null,
              ]),
            ) as any;
          } else if (
            method === 'PermissionController:getPermissions' ||
            method === 'ApprovalController:addRequest'
          ) {
            return {};
          } else if (
            method === 'PermissionController:grantPermissions' ||
            method === 'PermissionController:hasPermission'
          ) {
            return true;
          }
          return originalCall(method, ...args);
        });

      await multiChainController.onConnect(MOCK_ORIGIN, MOCK_CONNECT_ARGUMENTS);

      const result = await multiChainController.onRequest(MOCK_ORIGIN, {
        chainId: 'eip155:1',
        request: { method: 'eth_accounts', params: [] },
      });
      expect(result).toEqual(['eip155:1:foo']);
      expect(messengerCallMock).toHaveBeenCalledTimes(9);

      snapController.destroy();
      await executionService.terminateAllSnaps();
    });
  });
});

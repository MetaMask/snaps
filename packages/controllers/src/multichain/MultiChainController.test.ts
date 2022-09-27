/* eslint-disable jest/prefer-strict-equal */
import { fromEntries, getSnapPermissionName } from '@metamask/snap-utils';
import { MOCK_ORIGIN, MOCK_SNAP_ID } from '@metamask/snap-utils/test-utils';
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
          } else if (
            method === 'ApprovalController:addRequest' &&
            // @ts-expect-error Fix type
            args[0]?.type === 'multichain_connect'
          ) {
            return fromEntries(
              // @ts-expect-error Fix type
              Object.entries(args[0]?.requestData?.possibleAccounts).map(
                ([namespace, snapAndAccounts]) => [
                  namespace,
                  // @ts-expect-error Fix type
                  snapAndAccounts[0] ?? null,
                ],
              ),
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
          } else if (
            method === 'ApprovalController:addRequest' &&
            // @ts-expect-error Fix type
            args[0]?.type === 'multichain_connect'
          ) {
            return fromEntries(
              // @ts-expect-error Fix type
              Object.entries(args[0]?.requestData?.possibleAccounts).map(
                ([namespace, snapAndAccounts]) => [
                  namespace,
                  // @ts-expect-error Fix type
                  snapAndAccounts[0] ?? null,
                ],
              ),
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
        'SnapController:onSessionClose',
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

      expect(messengerCallMock).toHaveBeenCalledTimes(6);

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
          } else if (
            method === 'ApprovalController:addRequest' &&
            // @ts-expect-error Fix type
            args[0]?.type === 'multichain_connect'
          ) {
            return fromEntries(
              // @ts-expect-error Fix type
              Object.entries(args[0]?.requestData?.possibleAccounts).map(
                ([namespace, snapAndAccounts]) => [
                  namespace,
                  // @ts-expect-error Fix type
                  snapAndAccounts[0] ?? null,
                ],
              ),
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

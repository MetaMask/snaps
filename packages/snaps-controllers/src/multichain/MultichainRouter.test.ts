import { HandlerType } from '@metamask/snaps-utils';
import {
  getTruncatedSnap,
  MOCK_SNAP_ID,
} from '@metamask/snaps-utils/test-utils';

import { MultichainRouter } from './MultichainRouter';
import {
  getRootMultichainRouterMessenger,
  getRestrictedMultichainRouterMessenger,
  BTC_CAIP2,
  BTC_CONNECTED_ACCOUNTS,
  MOCK_SOLANA_SNAP_PERMISSIONS,
  SOLANA_CONNECTED_ACCOUNTS,
  SOLANA_CAIP2,
  MOCK_SOLANA_ACCOUNTS,
  MOCK_BTC_ACCOUNTS,
  getMockWithSnapKeyring,
} from '../test-utils';

describe('MultichainRouter', () => {
  describe('handleRequest', () => {
    it('can route signing requests to account Snaps without address resolution', async () => {
      const rootMessenger = getRootMultichainRouterMessenger();
      const messenger = getRestrictedMultichainRouterMessenger(rootMessenger);
      const withSnapKeyring = getMockWithSnapKeyring({
        submitRequest: jest.fn().mockResolvedValue({
          txid: '53de51e2fa75c3cfa51132865f7d430138b1cd92a8f5267ec836ec565b422969',
        }),
      });

      /* eslint-disable-next-line no-new */
      new MultichainRouter({
        messenger,
        withSnapKeyring,
      });

      rootMessenger.registerActionHandler(
        'AccountsController:listMultichainAccounts',
        () => MOCK_BTC_ACCOUNTS,
      );

      rootMessenger.registerActionHandler(
        'SnapController:handleRequest',
        async ({ handler }) => {
          if (handler === HandlerType.OnKeyringRequest) {
            return null;
          }
          throw new Error('Unmocked request');
        },
      );

      const result = await messenger.call('MultichainRouter:handleRequest', {
        connectedAddresses: BTC_CONNECTED_ACCOUNTS,
        scope: BTC_CAIP2,
        request: {
          method: 'sendBitcoin',
          params: {
            message: 'foo',
          },
        },
      });

      expect(result).toStrictEqual({
        txid: '53de51e2fa75c3cfa51132865f7d430138b1cd92a8f5267ec836ec565b422969',
      });
    });

    it('can route signing requests to account Snaps using address resolution', async () => {
      const rootMessenger = getRootMultichainRouterMessenger();
      const messenger = getRestrictedMultichainRouterMessenger(rootMessenger);
      const withSnapKeyring = getMockWithSnapKeyring({
        submitRequest: jest.fn().mockResolvedValue({
          signature: '0x',
        }),
      });

      /* eslint-disable-next-line no-new */
      new MultichainRouter({
        messenger,
        withSnapKeyring,
      });

      rootMessenger.registerActionHandler(
        'AccountsController:listMultichainAccounts',
        () => MOCK_SOLANA_ACCOUNTS,
      );

      rootMessenger.registerActionHandler(
        'PermissionController:getPermissions',
        () => MOCK_SOLANA_SNAP_PERMISSIONS,
      );

      rootMessenger.registerActionHandler(
        'SnapController:handleRequest',
        async ({ handler }) => {
          if (handler === HandlerType.OnKeyringRequest) {
            return { address: SOLANA_CONNECTED_ACCOUNTS[0] };
          }
          throw new Error('Unmocked request');
        },
      );

      const result = await messenger.call('MultichainRouter:handleRequest', {
        connectedAddresses: SOLANA_CONNECTED_ACCOUNTS,
        scope: SOLANA_CAIP2,
        request: {
          method: 'signAndSendTransaction',
          params: {
            message: 'foo',
          },
        },
      });

      expect(result).toStrictEqual({ signature: '0x' });
    });

    it('can route protocol requests to protocol Snaps', async () => {
      const rootMessenger = getRootMultichainRouterMessenger();
      const messenger = getRestrictedMultichainRouterMessenger(rootMessenger);
      const withSnapKeyring = getMockWithSnapKeyring();

      /* eslint-disable-next-line no-new */
      new MultichainRouter({
        messenger,
        withSnapKeyring,
      });

      rootMessenger.registerActionHandler(
        'AccountsController:listMultichainAccounts',
        () => [],
      );

      rootMessenger.registerActionHandler('SnapController:getAll', () => {
        return [getTruncatedSnap()];
      });

      rootMessenger.registerActionHandler(
        'PermissionController:getPermissions',
        () => MOCK_SOLANA_SNAP_PERMISSIONS,
      );

      rootMessenger.registerActionHandler(
        'SnapController:handleRequest',
        async () => ({
          'feature-set': 2891131721,
          'solana-core': '1.16.7',
        }),
      );

      const result = await messenger.call('MultichainRouter:handleRequest', {
        connectedAddresses: [],
        scope: SOLANA_CAIP2,
        origin: 'metamask',
        request: {
          method: 'getVersion',
        },
      });

      expect(result).toStrictEqual({
        'feature-set': 2891131721,
        'solana-core': '1.16.7',
      });

      expect(rootMessenger.call).toHaveBeenNthCalledWith(
        5,
        'SnapController:handleRequest',
        {
          snapId: MOCK_SNAP_ID,
          handler: HandlerType.OnProtocolRequest,
          origin: 'metamask',
          request: {
            method: '',
            params: {
              request: {
                id: expect.any(String),
                jsonrpc: '2.0',
                method: 'getVersion',
              },
              scope: SOLANA_CAIP2,
            },
          },
        },
      );
    });

    it('throws if no suitable Snaps are found', async () => {
      const rootMessenger = getRootMultichainRouterMessenger();
      const messenger = getRestrictedMultichainRouterMessenger(rootMessenger);
      const withSnapKeyring = getMockWithSnapKeyring();

      /* eslint-disable-next-line no-new */
      new MultichainRouter({
        messenger,
        withSnapKeyring,
      });

      rootMessenger.registerActionHandler(
        'AccountsController:listMultichainAccounts',
        () => [],
      );

      rootMessenger.registerActionHandler('SnapController:getAll', () => {
        return [];
      });

      await expect(
        messenger.call('MultichainRouter:handleRequest', {
          connectedAddresses: [],
          scope: SOLANA_CAIP2,
          request: {
            method: 'getVersion',
          },
        }),
      ).rejects.toThrow('The method does not exist / is not available');
    });

    it('throws if address resolution fails', async () => {
      const rootMessenger = getRootMultichainRouterMessenger();
      const messenger = getRestrictedMultichainRouterMessenger(rootMessenger);
      const withSnapKeyring = getMockWithSnapKeyring({
        // Simulate the Snap returning a bogus address
        resolveAccountAddress: jest.fn().mockResolvedValue({ address: 'foo' }),
      });

      /* eslint-disable-next-line no-new */
      new MultichainRouter({
        messenger,
        withSnapKeyring,
      });

      rootMessenger.registerActionHandler(
        'AccountsController:listMultichainAccounts',
        () => MOCK_SOLANA_ACCOUNTS,
      );

      rootMessenger.registerActionHandler(
        'PermissionController:getPermissions',
        () => MOCK_SOLANA_SNAP_PERMISSIONS,
      );

      await expect(
        messenger.call('MultichainRouter:handleRequest', {
          connectedAddresses: SOLANA_CONNECTED_ACCOUNTS,
          scope: SOLANA_CAIP2,
          request: {
            method: 'signAndSendTransaction',
            params: {
              message: 'foo',
            },
          },
        }),
      ).rejects.toThrow('Internal JSON-RPC error');
    });

    it('throws if address resolution returns an address that isnt available', async () => {
      const rootMessenger = getRootMultichainRouterMessenger();
      const messenger = getRestrictedMultichainRouterMessenger(rootMessenger);
      const withSnapKeyring = getMockWithSnapKeyring({
        // Simulate the Snap returning an unconnected address
        resolveAccountAddress: jest.fn().mockResolvedValue({
          address:
            'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp:7S3P4HxJpyyigGzodYwHtCxZyUQe9JiBMHyRWXArAaKa',
        }),
      });

      /* eslint-disable-next-line no-new */
      new MultichainRouter({
        messenger,
        withSnapKeyring,
      });

      rootMessenger.registerActionHandler(
        'AccountsController:listMultichainAccounts',
        () => MOCK_SOLANA_ACCOUNTS,
      );

      rootMessenger.registerActionHandler(
        'PermissionController:getPermissions',
        () => MOCK_SOLANA_SNAP_PERMISSIONS,
      );

      await expect(
        messenger.call('MultichainRouter:handleRequest', {
          connectedAddresses: SOLANA_CONNECTED_ACCOUNTS,
          scope: SOLANA_CAIP2,
          request: {
            method: 'signAndSendTransaction',
            params: {
              message: 'foo',
            },
          },
        }),
      ).rejects.toThrow('No available account found for request.');
    });

    it(`throws if address resolution returns a lower case address that isn't available`, async () => {
      const rootMessenger = getRootMultichainRouterMessenger();
      const messenger = getRestrictedMultichainRouterMessenger(rootMessenger);
      const withSnapKeyring = getMockWithSnapKeyring({
        // Simulate the Snap returning an unconnected address
        resolveAccountAddress: jest.fn().mockResolvedValue({
          address: `solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp:${MOCK_SOLANA_ACCOUNTS[0].address.toLowerCase()}`,
        }),
      });

      /* eslint-disable-next-line no-new */
      new MultichainRouter({
        messenger,
        withSnapKeyring,
      });

      rootMessenger.registerActionHandler(
        'AccountsController:listMultichainAccounts',
        () => MOCK_SOLANA_ACCOUNTS,
      );

      rootMessenger.registerActionHandler(
        'PermissionController:getPermissions',
        () => MOCK_SOLANA_SNAP_PERMISSIONS,
      );

      await expect(
        messenger.call('MultichainRouter:handleRequest', {
          connectedAddresses: SOLANA_CONNECTED_ACCOUNTS,
          scope: SOLANA_CAIP2,
          request: {
            method: 'signAndSendTransaction',
            params: {
              message: 'foo',
            },
          },
        }),
      ).rejects.toThrow('No available account found for request.');
    });
  });

  describe('getSupportedMethods', () => {
    it('returns a set of both protocol and account Snap methods', async () => {
      const rootMessenger = getRootMultichainRouterMessenger();
      const messenger = getRestrictedMultichainRouterMessenger(rootMessenger);
      const withSnapKeyring = getMockWithSnapKeyring();

      /* eslint-disable-next-line no-new */
      new MultichainRouter({
        messenger,
        withSnapKeyring,
      });

      rootMessenger.registerActionHandler('SnapController:getAll', () => {
        return [getTruncatedSnap()];
      });

      rootMessenger.registerActionHandler(
        'AccountsController:listMultichainAccounts',
        () => MOCK_SOLANA_ACCOUNTS,
      );

      rootMessenger.registerActionHandler(
        'PermissionController:getPermissions',
        () => MOCK_SOLANA_SNAP_PERMISSIONS,
      );

      expect(
        messenger.call('MultichainRouter:getSupportedMethods', SOLANA_CAIP2),
      ).toStrictEqual(['signAndSendTransaction', 'getVersion']);
    });

    it('handles lack of protocol Snaps', async () => {
      const rootMessenger = getRootMultichainRouterMessenger();
      const messenger = getRestrictedMultichainRouterMessenger(rootMessenger);
      const withSnapKeyring = getMockWithSnapKeyring();

      /* eslint-disable-next-line no-new */
      new MultichainRouter({
        messenger,
        withSnapKeyring,
      });

      rootMessenger.registerActionHandler('SnapController:getAll', () => {
        return [getTruncatedSnap()];
      });

      rootMessenger.registerActionHandler(
        'AccountsController:listMultichainAccounts',
        () => MOCK_SOLANA_ACCOUNTS,
      );

      rootMessenger.registerActionHandler(
        'PermissionController:getPermissions',
        () => ({}),
      );

      expect(
        messenger.call('MultichainRouter:getSupportedMethods', SOLANA_CAIP2),
      ).toStrictEqual(['signAndSendTransaction']);
    });

    it('handles lack of account Snaps', async () => {
      const rootMessenger = getRootMultichainRouterMessenger();
      const messenger = getRestrictedMultichainRouterMessenger(rootMessenger);
      const withSnapKeyring = getMockWithSnapKeyring();

      /* eslint-disable-next-line no-new */
      new MultichainRouter({
        messenger,
        withSnapKeyring,
      });

      rootMessenger.registerActionHandler('SnapController:getAll', () => {
        return [getTruncatedSnap()];
      });

      rootMessenger.registerActionHandler(
        'AccountsController:listMultichainAccounts',
        () => [],
      );

      rootMessenger.registerActionHandler(
        'PermissionController:getPermissions',
        () => MOCK_SOLANA_SNAP_PERMISSIONS,
      );

      expect(
        messenger.call('MultichainRouter:getSupportedMethods', SOLANA_CAIP2),
      ).toStrictEqual(['getVersion']);
    });
  });

  describe('getSupportedAccounts', () => {
    it('returns a set of accounts for the requested scope', async () => {
      const rootMessenger = getRootMultichainRouterMessenger();
      const messenger = getRestrictedMultichainRouterMessenger(rootMessenger);
      const withSnapKeyring = getMockWithSnapKeyring();

      /* eslint-disable-next-line no-new */
      new MultichainRouter({
        messenger,
        withSnapKeyring,
      });

      rootMessenger.registerActionHandler(
        'AccountsController:listMultichainAccounts',
        () => MOCK_SOLANA_ACCOUNTS,
      );

      expect(
        messenger.call('MultichainRouter:getSupportedAccounts', SOLANA_CAIP2),
      ).toStrictEqual([
        'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp:7S3P4HxJpyyigGzodYwHtCxZyUQe9JiBMHyRWXArAaKv',
      ]);
    });
  });

  describe('isSupportedScope', () => {
    it('returns true if an account Snap exists', async () => {
      const rootMessenger = getRootMultichainRouterMessenger();
      const messenger = getRestrictedMultichainRouterMessenger(rootMessenger);
      const withSnapKeyring = getMockWithSnapKeyring();

      /* eslint-disable-next-line no-new */
      new MultichainRouter({
        messenger,
        withSnapKeyring,
      });

      rootMessenger.registerActionHandler('SnapController:getAll', () => {
        return [getTruncatedSnap()];
      });

      rootMessenger.registerActionHandler(
        'PermissionController:getPermissions',
        () => ({}),
      );

      rootMessenger.registerActionHandler(
        'AccountsController:listMultichainAccounts',
        () => MOCK_SOLANA_ACCOUNTS,
      );

      expect(
        messenger.call('MultichainRouter:isSupportedScope', SOLANA_CAIP2),
      ).toBe(true);
    });

    it('returns true if a protocol Snap exists', async () => {
      const rootMessenger = getRootMultichainRouterMessenger();
      const messenger = getRestrictedMultichainRouterMessenger(rootMessenger);
      const withSnapKeyring = getMockWithSnapKeyring();

      /* eslint-disable-next-line no-new */
      new MultichainRouter({
        messenger,
        withSnapKeyring,
      });

      rootMessenger.registerActionHandler('SnapController:getAll', () => {
        return [getTruncatedSnap()];
      });

      rootMessenger.registerActionHandler(
        'PermissionController:getPermissions',
        () => MOCK_SOLANA_SNAP_PERMISSIONS,
      );

      rootMessenger.registerActionHandler(
        'AccountsController:listMultichainAccounts',
        () => [],
      );

      expect(
        messenger.call('MultichainRouter:isSupportedScope', SOLANA_CAIP2),
      ).toBe(true);
    });

    it('returns false if no Snap is found', async () => {
      const rootMessenger = getRootMultichainRouterMessenger();
      const messenger = getRestrictedMultichainRouterMessenger(rootMessenger);
      const withSnapKeyring = getMockWithSnapKeyring();

      /* eslint-disable-next-line no-new */
      new MultichainRouter({
        messenger,
        withSnapKeyring,
      });

      rootMessenger.registerActionHandler('SnapController:getAll', () => {
        return [];
      });

      rootMessenger.registerActionHandler(
        'AccountsController:listMultichainAccounts',
        () => [],
      );

      expect(
        messenger.call('MultichainRouter:isSupportedScope', SOLANA_CAIP2),
      ).toBe(false);
    });
  });
});

import {
  JsonRpcEngine,
  createOriginMiddleware,
} from '@metamask/json-rpc-engine';
import type {
  ListEntropySourcesParams,
  ListEntropySourcesResult,
} from '@metamask/snaps-sdk';
import {
  MOCK_SNAP_ID,
  MockControllerMessenger,
} from '@metamask/snaps-utils/test-utils';
import type { JsonRpcRequest, PendingJsonRpcResponse } from '@metamask/utils';

import type { ListEntropySourcesMethodActions } from './listEntropySources';
import { listEntropySourcesHandler } from './listEntropySources';

describe('snap_listEntropySources', () => {
  describe('listEntropySourcesHandler', () => {
    it('has the expected shape', () => {
      expect(listEntropySourcesHandler).toMatchObject({
        implementation: expect.any(Function),
        hookNames: {
          getUnlockPromise: true,
        },
        actionNames: [
          'PermissionController:hasPermission',
          'KeyringController:getState',
        ],
      });
    });
  });

  describe('implementation', () => {
    const keyrings = [
      {
        type: 'HD Key Tree',
        metadata: { id: 'baz', name: 'Primary secret recovery phrase' },
      },
      {
        type: 'HD Key Tree',
        metadata: { id: 'foo', name: 'Secret recovery phrase 1' },
      },
      {
        type: 'HD Key Tree',
        metadata: { id: 'bar', name: 'Secret recovery phrase 2' },
      },
      {
        type: 'Ledger Hardware',
        metadata: { id: 'ledger', name: 'Ledger' },
      },
    ];

    const getMessenger = () => {
      const messenger = new MockControllerMessenger<
        ListEntropySourcesMethodActions,
        never
      >();

      messenger.registerActionHandler(
        'PermissionController:hasPermission',
        () => true,
      );

      messenger.registerActionHandler('KeyringController:getState', () => ({
        isUnlocked: true,
        keyrings,
      }));

      jest.spyOn(messenger, 'call');

      return messenger;
    };

    it('returns the result derived from the `KeyringController:getState` action', async () => {
      const { implementation } = listEntropySourcesHandler;

      const getUnlockPromise = jest.fn();
      const hooks = { getUnlockPromise };

      const messenger = getMessenger();

      const engine = new JsonRpcEngine();

      engine.push(createOriginMiddleware(MOCK_SNAP_ID));
      engine.push((request, response, next, end) => {
        const result = implementation(
          request as JsonRpcRequest<ListEntropySourcesParams> & {
            origin: string;
          },
          response as PendingJsonRpcResponse<ListEntropySourcesResult>,
          next,
          end,
          hooks,
          messenger,
        );

        result?.catch(end);
      });

      const response = await engine.handle({
        jsonrpc: '2.0',
        id: 1,
        method: 'snap_listEntropySources',
      });

      expect(getUnlockPromise).toHaveBeenCalledWith(true);
      expect(response).toStrictEqual({
        jsonrpc: '2.0',
        id: 1,
        result: [
          {
            name: 'Primary secret recovery phrase',
            id: 'baz',
            type: 'mnemonic',
            primary: true,
          },
          {
            name: 'Secret recovery phrase 1',
            id: 'foo',
            type: 'mnemonic',
            primary: false,
          },
          {
            name: 'Secret recovery phrase 2',
            id: 'bar',
            type: 'mnemonic',
            primary: false,
          },
        ],
      });
    });

    it('returns an unauthorized error if the requesting origin does not have the required permission', async () => {
      const { implementation } = listEntropySourcesHandler;

      const getUnlockPromise = jest.fn();
      const hooks = { getUnlockPromise };

      const messenger = getMessenger();

      messenger.registerActionHandler(
        'PermissionController:hasPermission',
        () => false,
      );

      const engine = new JsonRpcEngine();

      engine.push(createOriginMiddleware(MOCK_SNAP_ID));
      engine.push((request, response, next, end) => {
        const result = implementation(
          request as JsonRpcRequest<ListEntropySourcesParams> & {
            origin: string;
          },
          response as PendingJsonRpcResponse<ListEntropySourcesResult>,
          next,
          end,
          hooks,
          messenger,
        );

        result?.catch(end);
      });

      const response = await engine.handle({
        jsonrpc: '2.0',
        id: 1,
        method: 'snap_listEntropySources',
      });

      expect(getUnlockPromise).not.toHaveBeenCalled();
      expect(response).toStrictEqual({
        jsonrpc: '2.0',
        id: 1,
        error: {
          code: 4100,
          message:
            'The requested account and/or method has not been authorized by the user.',
          stack: expect.any(String),
        },
      });
    });
  });
});

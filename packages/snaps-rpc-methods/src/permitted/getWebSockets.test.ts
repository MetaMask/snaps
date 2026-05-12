import {
  JsonRpcEngine,
  createOriginMiddleware,
} from '@metamask/json-rpc-engine';
import { rpcErrors } from '@metamask/rpc-errors';
import type {
  GetWebSocketsParams,
  GetWebSocketsResult,
} from '@metamask/snaps-sdk';
import {
  MOCK_SNAP_ID,
  MockControllerMessenger,
} from '@metamask/snaps-utils/test-utils';
import type { PendingJsonRpcResponse } from '@metamask/utils';

import type { GetWebSocketsMethodActions } from './getWebSockets';
import { getWebSocketsHandler } from './getWebSockets';
import type { JsonRpcRequestWithOrigin } from '../types';

describe('snap_getWebSockets', () => {
  describe('openWebSocketHandler', () => {
    it('has the expected shape', () => {
      expect(getWebSocketsHandler).toMatchObject({
        implementation: expect.any(Function),
        actionNames: [
          'PermissionController:hasPermission',
          'WebSocketService:getAll',
        ],
      });
    });
  });

  describe('implementation', () => {
    const getMessenger = () => {
      const messenger = new MockControllerMessenger<
        GetWebSocketsMethodActions,
        never
      >();

      messenger.registerActionHandler(
        'PermissionController:hasPermission',
        () => true,
      );

      messenger.registerActionHandler('WebSocketService:getAll', () => [
        { id: 'foo', url: 'wss://metamask.io', protocols: [] },
      ]);

      jest.spyOn(messenger, 'call');

      return messenger;
    };

    it('throws if the origin does not have permission', async () => {
      const { implementation } = getWebSocketsHandler;

      const messenger = getMessenger();

      messenger.registerActionHandler(
        'PermissionController:hasPermission',
        () => false,
      );

      const engine = new JsonRpcEngine();

      engine.push(createOriginMiddleware(MOCK_SNAP_ID));
      engine.push((request, response, next, end) => {
        const result = implementation(
          request as JsonRpcRequestWithOrigin<GetWebSocketsParams>,
          response as PendingJsonRpcResponse<GetWebSocketsResult>,
          next,
          end,
          {} as never,
          messenger,
        );

        result?.catch(end);
      });

      const response = await engine.handle({
        jsonrpc: '2.0',
        id: 1,
        method: 'snap_getWebSockets',
      });

      expect(response).toStrictEqual({
        error: {
          code: 4100,
          message:
            'The requested account and/or method has not been authorized by the user.',
          stack: expect.any(String),
        },
        id: 1,
        jsonrpc: '2.0',
      });
    });

    it('returns the open WebSocket connections', async () => {
      const { implementation } = getWebSocketsHandler;

      const messenger = getMessenger();

      const engine = new JsonRpcEngine();

      engine.push(createOriginMiddleware(MOCK_SNAP_ID));
      engine.push((request, response, next, end) => {
        const result = implementation(
          request as JsonRpcRequestWithOrigin<GetWebSocketsParams>,
          response as PendingJsonRpcResponse<GetWebSocketsResult>,
          next,
          end,
          {} as never,
          messenger,
        );

        result?.catch(end);
      });

      const response = await engine.handle({
        jsonrpc: '2.0',
        id: 1,
        method: 'snap_getWebSockets',
      });

      expect(response).toStrictEqual({
        jsonrpc: '2.0',
        id: 1,
        result: [{ id: 'foo', url: 'wss://metamask.io', protocols: [] }],
      });
      expect(messenger.call).toHaveBeenCalledWith(
        'WebSocketService:getAll',
        MOCK_SNAP_ID,
      );
    });

    it('returns an error thrown by the action', async () => {
      const { implementation } = getWebSocketsHandler;

      const messenger = getMessenger();

      messenger.registerActionHandler('WebSocketService:getAll', () => {
        throw rpcErrors.internal();
      });

      const engine = new JsonRpcEngine();

      engine.push(createOriginMiddleware(MOCK_SNAP_ID));
      engine.push((request, response, next, end) => {
        const result = implementation(
          request as JsonRpcRequestWithOrigin<GetWebSocketsParams>,
          response as PendingJsonRpcResponse<GetWebSocketsResult>,
          next,
          end,
          {} as never,
          messenger,
        );

        result?.catch(end);
      });

      const response = await engine.handle({
        jsonrpc: '2.0',
        id: 1,
        method: 'snap_getWebSockets',
      });

      expect(response).toStrictEqual({
        error: {
          code: -32603,
          message: 'Internal JSON-RPC error.',
          stack: expect.any(String),
        },
        id: 1,
        jsonrpc: '2.0',
      });
    });
  });
});

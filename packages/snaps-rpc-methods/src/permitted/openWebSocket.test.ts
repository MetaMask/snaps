import {
  JsonRpcEngine,
  createOriginMiddleware,
} from '@metamask/json-rpc-engine';
import type { OpenWebSocketResult } from '@metamask/snaps-sdk';
import {
  MOCK_SNAP_ID,
  MockControllerMessenger,
} from '@metamask/snaps-utils/test-utils';
import type { JsonRpcRequest, PendingJsonRpcResponse } from '@metamask/utils';

import type {
  OpenWebSocketMethodActions,
  OpenWebSocketParameters,
} from './openWebSocket';
import { openWebSocketHandler } from './openWebSocket';

describe('snap_openWebSocket', () => {
  describe('openWebSocketHandler', () => {
    it('has the expected shape', () => {
      expect(openWebSocketHandler).toMatchObject({
        implementation: expect.any(Function),
        actionNames: [
          'PermissionController:hasPermission',
          'WebSocketService:open',
        ],
      });
    });
  });

  describe('implementation', () => {
    const getMessenger = () => {
      const messenger = new MockControllerMessenger<
        OpenWebSocketMethodActions,
        never
      >();

      messenger.registerActionHandler(
        'PermissionController:hasPermission',
        () => true,
      );

      messenger.registerActionHandler(
        'WebSocketService:open',
        async () => 'foo',
      );

      jest.spyOn(messenger, 'call');

      return messenger;
    };

    it('throws if the origin does not have permission', async () => {
      const { implementation } = openWebSocketHandler;

      const messenger = getMessenger();

      messenger.registerActionHandler(
        'PermissionController:hasPermission',
        () => false,
      );

      const engine = new JsonRpcEngine();

      engine.push(createOriginMiddleware(MOCK_SNAP_ID));
      engine.push((request, response, next, end) => {
        const result = implementation(
          request as JsonRpcRequest<OpenWebSocketParameters> & {
            origin: string;
          },
          response as PendingJsonRpcResponse<OpenWebSocketResult>,
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
        method: 'snap_openWebSocket',
        params: {
          url: 'wss://metamask.io',
        },
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

    it('throws if invalid parameters are passed', async () => {
      const { implementation } = openWebSocketHandler;

      const messenger = getMessenger();

      const engine = new JsonRpcEngine();

      engine.push(createOriginMiddleware(MOCK_SNAP_ID));
      engine.push((request, response, next, end) => {
        const result = implementation(
          request as JsonRpcRequest<OpenWebSocketParameters> & {
            origin: string;
          },
          response as PendingJsonRpcResponse<OpenWebSocketResult>,
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
        method: 'snap_openWebSocket',
        params: {
          url: 'http://metamask.io',
        },
      });

      expect(response).toStrictEqual({
        error: {
          code: -32602,
          message:
            'Invalid params: At path: url -- At path: protocol -- Expected the value to satisfy a union of `"wss:" | "ws:"`, but received: "http:".',
          stack: expect.any(String),
        },
        id: 1,
        jsonrpc: '2.0',
      });
    });

    it('opens a WebSocket and returns the ID', async () => {
      const { implementation } = openWebSocketHandler;

      const messenger = getMessenger();

      const engine = new JsonRpcEngine();

      engine.push(createOriginMiddleware(MOCK_SNAP_ID));
      engine.push((request, response, next, end) => {
        const result = implementation(
          request as JsonRpcRequest<OpenWebSocketParameters> & {
            origin: string;
          },
          response as PendingJsonRpcResponse<OpenWebSocketResult>,
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
        method: 'snap_openWebSocket',
        params: {
          url: 'wss://metamask.io',
        },
      });

      expect(response).toStrictEqual({ jsonrpc: '2.0', id: 1, result: 'foo' });
      expect(messenger.call).toHaveBeenCalledWith(
        'WebSocketService:open',
        MOCK_SNAP_ID,
        'wss://metamask.io',
        undefined,
      );
    });
  });
});

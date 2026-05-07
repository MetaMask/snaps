import { JsonRpcEngine } from '@metamask/json-rpc-engine';
import type { SendWebSocketMessageResult } from '@metamask/snaps-sdk';
import {
  MOCK_SNAP_ID,
  MockControllerMessenger,
  createOriginMiddleware,
} from '@metamask/snaps-utils/test-utils';
import type { JsonRpcRequest, PendingJsonRpcResponse } from '@metamask/utils';

import type {
  SendWebSocketMessageMethodActions,
  SendWebSocketMessageParameters,
} from './sendWebSocketMessage';
import { sendWebSocketMessageHandler } from './sendWebSocketMessage';

describe('snap_sendWebSocketMessage', () => {
  describe('sendWebSocketMessageHandler', () => {
    it('has the expected shape', () => {
      expect(sendWebSocketMessageHandler).toMatchObject({
        implementation: expect.any(Function),
        actionNames: [
          'PermissionController:hasPermission',
          'WebSocketService:sendMessage',
        ],
      });
    });
  });

  describe('implementation', () => {
    const getMessenger = () => {
      const messenger = new MockControllerMessenger<
        SendWebSocketMessageMethodActions,
        never
      >();

      messenger.registerActionHandler(
        'PermissionController:hasPermission',
        () => true,
      );

      messenger.registerActionHandler(
        'WebSocketService:sendMessage',
        async () => undefined,
      );

      jest.spyOn(messenger, 'call');

      return messenger;
    };

    it('throws if the origin does not have permission', async () => {
      const { implementation } = sendWebSocketMessageHandler;

      const messenger = getMessenger();

      messenger.registerActionHandler(
        'PermissionController:hasPermission',
        () => false,
      );

      const engine = new JsonRpcEngine();

      engine.push(createOriginMiddleware(MOCK_SNAP_ID));
      engine.push((request, response, next, end) => {
        const result = implementation(
          request as JsonRpcRequest<SendWebSocketMessageParameters> & {
            origin: string;
          },
          response as PendingJsonRpcResponse<SendWebSocketMessageResult>,
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
        method: 'snap_sendWebSocketMessage',
        params: {},
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
      const { implementation } = sendWebSocketMessageHandler;

      const messenger = getMessenger();

      const engine = new JsonRpcEngine();

      engine.push(createOriginMiddleware(MOCK_SNAP_ID));
      engine.push((request, response, next, end) => {
        const result = implementation(
          request as JsonRpcRequest<SendWebSocketMessageParameters> & {
            origin: string;
          },
          response as PendingJsonRpcResponse<SendWebSocketMessageResult>,
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
        method: 'snap_sendWebSocketMessage',
        params: {},
      });

      expect(response).toStrictEqual({
        error: {
          code: -32602,
          message:
            'Invalid params: At path: id -- Expected a string, but received: undefined.',
          stack: expect.any(String),
        },
        id: 1,
        jsonrpc: '2.0',
      });
    });

    it('sends a WebSocket message and returns null', async () => {
      const { implementation } = sendWebSocketMessageHandler;

      const messenger = getMessenger();

      const engine = new JsonRpcEngine();

      engine.push(createOriginMiddleware(MOCK_SNAP_ID));
      engine.push((request, response, next, end) => {
        const result = implementation(
          request as JsonRpcRequest<SendWebSocketMessageParameters> & {
            origin: string;
          },
          response as PendingJsonRpcResponse<SendWebSocketMessageResult>,
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
        method: 'snap_sendWebSocketMessage',
        params: {
          id: 'foo',
          message: 'Hello world!',
        },
      });

      expect(response).toStrictEqual({ jsonrpc: '2.0', id: 1, result: null });
      expect(messenger.call).toHaveBeenCalledWith(
        'WebSocketService:sendMessage',
        MOCK_SNAP_ID,
        'foo',
        'Hello world!',
      );
    });
  });
});

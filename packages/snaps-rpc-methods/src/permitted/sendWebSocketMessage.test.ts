import { JsonRpcEngine } from '@metamask/json-rpc-engine';
import type { SendWebSocketMessageResult } from '@metamask/snaps-sdk';
import type { JsonRpcRequest, PendingJsonRpcResponse } from '@metamask/utils';

import type { SendWebSocketMessageParameters } from './sendWebSocketMessage';
import { sendWebSocketMessageHandler } from './sendWebSocketMessage';

describe('snap_sendWebSocketMessage', () => {
  describe('sendWebSocketMessageHandler', () => {
    it('has the expected shape', () => {
      expect(sendWebSocketMessageHandler).toMatchObject({
        methodNames: ['snap_sendWebSocketMessage'],
        implementation: expect.any(Function),
        hookNames: {
          hasPermission: true,
          sendWebSocketMessage: true,
        },
      });
    });
  });

  describe('implementation', () => {
    it('throws if the origin does not have permission', async () => {
      const { implementation } = sendWebSocketMessageHandler;

      const sendWebSocketMessage = jest.fn().mockResolvedValue(undefined);
      const hasPermission = jest.fn().mockReturnValue(false);
      const hooks = { hasPermission, sendWebSocketMessage };

      const engine = new JsonRpcEngine();

      engine.push((request, response, next, end) => {
        const result = implementation(
          request as JsonRpcRequest<SendWebSocketMessageParameters>,
          response as PendingJsonRpcResponse<SendWebSocketMessageResult>,
          next,
          end,
          hooks,
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

      const sendWebSocketMessage = jest.fn().mockResolvedValue(undefined);
      const hasPermission = jest.fn().mockReturnValue(true);
      const hooks = { hasPermission, sendWebSocketMessage };

      const engine = new JsonRpcEngine();

      engine.push((request, response, next, end) => {
        const result = implementation(
          request as JsonRpcRequest<SendWebSocketMessageParameters>,
          response as PendingJsonRpcResponse<SendWebSocketMessageResult>,
          next,
          end,
          hooks,
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

      const sendWebSocketMessage = jest.fn().mockResolvedValue(undefined);
      const hasPermission = jest.fn().mockReturnValue(true);
      const hooks = { hasPermission, sendWebSocketMessage };

      const engine = new JsonRpcEngine();

      engine.push((request, response, next, end) => {
        const result = implementation(
          request as JsonRpcRequest<SendWebSocketMessageParameters>,
          response as PendingJsonRpcResponse<SendWebSocketMessageResult>,
          next,
          end,
          hooks,
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
      expect(sendWebSocketMessage).toHaveBeenCalledWith('foo', 'Hello world!');
    });
  });
});

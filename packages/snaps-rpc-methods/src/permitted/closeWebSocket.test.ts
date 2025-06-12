import { JsonRpcEngine } from '@metamask/json-rpc-engine';
import type { CloseWebSocketResult } from '@metamask/snaps-sdk';
import type { JsonRpcRequest, PendingJsonRpcResponse } from '@metamask/utils';

import type { CloseWebSocketParameters } from './closeWebSocket';
import { closeWebSocketHandler } from './closeWebSocket';

describe('snap_closeWebSocket', () => {
  describe('closeWebSocketHandler', () => {
    it('has the expected shape', () => {
      expect(closeWebSocketHandler).toMatchObject({
        methodNames: ['snap_closeWebSocket'],
        implementation: expect.any(Function),
        hookNames: {
          hasPermission: true,
          closeWebSocket: true,
        },
      });
    });
  });

  describe('implementation', () => {
    it('throws if the origin does not have permission', async () => {
      const { implementation } = closeWebSocketHandler;

      const closeWebSocket = jest.fn();
      const hasPermission = jest.fn().mockReturnValue(false);
      const hooks = { hasPermission, closeWebSocket };

      const engine = new JsonRpcEngine();

      engine.push((request, response, next, end) => {
        const result = implementation(
          request as JsonRpcRequest<CloseWebSocketParameters>,
          response as PendingJsonRpcResponse<CloseWebSocketResult>,
          next,
          end,
          hooks,
        );

        result?.catch(end);
      });

      const response = await engine.handle({
        jsonrpc: '2.0',
        id: 1,
        method: 'snap_closeWebSocket',
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
      const { implementation } = closeWebSocketHandler;

      const closeWebSocket = jest.fn();
      const hasPermission = jest.fn().mockReturnValue(true);
      const hooks = { hasPermission, closeWebSocket };

      const engine = new JsonRpcEngine();

      engine.push((request, response, next, end) => {
        const result = implementation(
          request as JsonRpcRequest<CloseWebSocketParameters>,
          response as PendingJsonRpcResponse<CloseWebSocketResult>,
          next,
          end,
          hooks,
        );

        result?.catch(end);
      });

      const response = await engine.handle({
        jsonrpc: '2.0',
        id: 1,
        method: 'snap_closeWebSocket',
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

    it('closes a WebSocket and returns null', async () => {
      const { implementation } = closeWebSocketHandler;

      const closeWebSocket = jest.fn();
      const hasPermission = jest.fn().mockReturnValue(true);
      const hooks = { hasPermission, closeWebSocket };

      const engine = new JsonRpcEngine();

      engine.push((request, response, next, end) => {
        const result = implementation(
          request as JsonRpcRequest<CloseWebSocketParameters>,
          response as PendingJsonRpcResponse<CloseWebSocketResult>,
          next,
          end,
          hooks,
        );

        result?.catch(end);
      });

      const response = await engine.handle({
        jsonrpc: '2.0',
        id: 1,
        method: 'snap_closeWebSocket',
        params: { id: 'foo' },
      });

      expect(response).toStrictEqual({ jsonrpc: '2.0', id: 1, result: null });
      expect(closeWebSocket).toHaveBeenCalledWith('foo');
    });
  });
});

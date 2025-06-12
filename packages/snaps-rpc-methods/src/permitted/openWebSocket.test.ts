import { JsonRpcEngine } from '@metamask/json-rpc-engine';
import type { OpenWebSocketResult } from '@metamask/snaps-sdk';
import type { JsonRpcRequest, PendingJsonRpcResponse } from '@metamask/utils';

import type { OpenWebSocketParameters } from './openWebSocket';
import { openWebSocketHandler } from './openWebSocket';

describe('snap_openWebSocket', () => {
  describe('openWebSocketHandler', () => {
    it('has the expected shape', () => {
      expect(openWebSocketHandler).toMatchObject({
        methodNames: ['snap_openWebSocket'],
        implementation: expect.any(Function),
        hookNames: {
          hasPermission: true,
          openWebSocket: true,
        },
      });
    });
  });

  describe('implementation', () => {
    it('throws if the origin does not have permission', async () => {
      const { implementation } = openWebSocketHandler;

      const openWebSocket = jest.fn();
      const hasPermission = jest.fn().mockReturnValue(false);
      const hooks = { hasPermission, openWebSocket };

      const engine = new JsonRpcEngine();

      engine.push((request, response, next, end) => {
        const result = implementation(
          request as JsonRpcRequest<OpenWebSocketParameters>,
          response as PendingJsonRpcResponse<OpenWebSocketResult>,
          next,
          end,
          hooks,
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

      const openWebSocket = jest.fn();
      const hasPermission = jest.fn().mockReturnValue(true);
      const hooks = { hasPermission, openWebSocket };

      const engine = new JsonRpcEngine();

      engine.push((request, response, next, end) => {
        const result = implementation(
          request as JsonRpcRequest<OpenWebSocketParameters>,
          response as PendingJsonRpcResponse<OpenWebSocketResult>,
          next,
          end,
          hooks,
        );

        result?.catch(end);
      });

      const response = await engine.handle({
        jsonrpc: '2.0',
        id: 1,
        method: 'snap_openWebSocket',
        params: {
          url: 'ws://metamask.io',
        },
      });

      expect(response).toStrictEqual({
        error: {
          code: -32602,
          message:
            'Invalid params: At path: url -- Expected URL, got "ws://metamask.io"..',
          stack: expect.any(String),
        },
        id: 1,
        jsonrpc: '2.0',
      });
    });

    it('opens a WebSocket and returns the ID', async () => {
      const { implementation } = openWebSocketHandler;

      const openWebSocket = jest.fn().mockResolvedValue('foo');
      const hasPermission = jest.fn().mockReturnValue(true);
      const hooks = { hasPermission, openWebSocket };

      const engine = new JsonRpcEngine();

      engine.push((request, response, next, end) => {
        const result = implementation(
          request as JsonRpcRequest<OpenWebSocketParameters>,
          response as PendingJsonRpcResponse<OpenWebSocketResult>,
          next,
          end,
          hooks,
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
      expect(openWebSocket).toHaveBeenCalledWith(
        'wss://metamask.io',
        undefined,
      );
    });
  });
});

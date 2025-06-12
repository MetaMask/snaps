import { JsonRpcEngine } from '@metamask/json-rpc-engine';
import { rpcErrors } from '@metamask/rpc-errors';
import type {
  GetWebSocketsParams,
  GetWebSocketsResult,
} from '@metamask/snaps-sdk';
import type { JsonRpcRequest, PendingJsonRpcResponse } from '@metamask/utils';

import { getWebSocketsHandler } from './getWebSockets';

describe('snap_getWebSockets', () => {
  describe('openWebSocketHandler', () => {
    it('has the expected shape', () => {
      expect(getWebSocketsHandler).toMatchObject({
        methodNames: ['snap_getWebSockets'],
        implementation: expect.any(Function),
        hookNames: {
          hasPermission: true,
          getWebSockets: true,
        },
      });
    });
  });

  describe('implementation', () => {
    it('throws if the origin does not have permission', async () => {
      const { implementation } = getWebSocketsHandler;

      const getWebSockets = jest.fn();
      const hasPermission = jest.fn().mockReturnValue(false);
      const hooks = { hasPermission, getWebSockets };

      const engine = new JsonRpcEngine();

      engine.push((request, response, next, end) => {
        const result = implementation(
          request as JsonRpcRequest<GetWebSocketsParams>,
          response as PendingJsonRpcResponse<GetWebSocketsResult>,
          next,
          end,
          hooks,
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

      const getWebSockets = jest
        .fn()
        .mockReturnValue([{ id: 'foo', url: 'wss://metamask.io' }]);
      const hasPermission = jest.fn().mockReturnValue(true);
      const hooks = { hasPermission, getWebSockets };

      const engine = new JsonRpcEngine();

      engine.push((request, response, next, end) => {
        const result = implementation(
          request as JsonRpcRequest<GetWebSocketsParams>,
          response as PendingJsonRpcResponse<GetWebSocketsResult>,
          next,
          end,
          hooks,
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
        result: [{ id: 'foo', url: 'wss://metamask.io' }],
      });
      expect(getWebSockets).toHaveBeenCalledWith();
    });

    it('returns an error thrown by the hook', async () => {
      const { implementation } = getWebSocketsHandler;

      const getWebSockets = jest.fn().mockImplementation(() => {
        throw rpcErrors.internal();
      });
      const hasPermission = jest.fn().mockReturnValue(true);
      const hooks = { hasPermission, getWebSockets };

      const engine = new JsonRpcEngine();

      engine.push((request, response, next, end) => {
        const result = implementation(
          request as JsonRpcRequest<GetWebSocketsParams>,
          response as PendingJsonRpcResponse<GetWebSocketsResult>,
          next,
          end,
          hooks,
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

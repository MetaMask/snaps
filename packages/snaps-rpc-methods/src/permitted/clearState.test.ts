import { JsonRpcEngine } from '@metamask/json-rpc-engine';
import { errorCodes } from '@metamask/rpc-errors';
import type { ClearStateResult } from '@metamask/snaps-sdk';
import type { JsonRpcRequest, PendingJsonRpcResponse } from '@metamask/utils';

import type { ClearStateParameters } from './clearState';
import { clearStateHandler } from './clearState';

describe('snap_clearState', () => {
  describe('clearStateHandler', () => {
    it('has the expected shape', () => {
      expect(clearStateHandler).toMatchObject({
        methodNames: ['snap_clearState'],
        implementation: expect.any(Function),
        hookNames: {
          clearSnapState: true,
          hasPermission: true,
        },
      });
    });
  });

  describe('implementation', () => {
    it('returns the result from the `clearSnapState` hook', async () => {
      const { implementation } = clearStateHandler;

      const clearSnapState = jest.fn().mockReturnValue(null);
      const hasPermission = jest.fn().mockReturnValue(true);

      const hooks = {
        clearSnapState,
        hasPermission,
      };

      const engine = new JsonRpcEngine();

      engine.push((request, response, next, end) => {
        const result = implementation(
          request as JsonRpcRequest<ClearStateParameters>,
          response as PendingJsonRpcResponse<ClearStateResult>,
          next,
          end,
          hooks,
        );

        result?.catch(end);
      });

      const response = await engine.handle({
        jsonrpc: '2.0',
        id: 1,
        method: 'snap_clearState',
        params: {},
      });

      expect(clearSnapState).toHaveBeenCalledWith(true);
      expect(response).toStrictEqual({
        jsonrpc: '2.0',
        id: 1,
        result: null,
      });
    });

    it('clears unencrypted state if specified', async () => {
      const { implementation } = clearStateHandler;

      const clearSnapState = jest.fn().mockReturnValue(null);
      const hasPermission = jest.fn().mockReturnValue(true);

      const hooks = {
        clearSnapState,
        hasPermission,
      };

      const engine = new JsonRpcEngine();

      engine.push((request, response, next, end) => {
        const result = implementation(
          request as JsonRpcRequest<ClearStateParameters>,
          response as PendingJsonRpcResponse<ClearStateResult>,
          next,
          end,
          hooks,
        );

        result?.catch(end);
      });

      const response = await engine.handle({
        jsonrpc: '2.0',
        id: 1,
        method: 'snap_clearState',
        params: {
          encrypted: false,
        },
      });

      expect(clearSnapState).toHaveBeenCalledWith(false);
      expect(response).toStrictEqual({
        jsonrpc: '2.0',
        id: 1,
        result: null,
      });
    });

    it('throws if the requesting origin does not have the required permission', async () => {
      const { implementation } = clearStateHandler;

      const clearSnapState = jest.fn();
      const hasPermission = jest.fn().mockReturnValue(false);

      const hooks = {
        clearSnapState,
        hasPermission,
      };

      const engine = new JsonRpcEngine();

      engine.push((request, response, next, end) => {
        const result = implementation(
          request as JsonRpcRequest<ClearStateParameters>,
          response as PendingJsonRpcResponse<ClearStateResult>,
          next,
          end,
          hooks,
        );

        result?.catch(end);
      });

      const response = await engine.handle({
        jsonrpc: '2.0',
        id: 1,
        method: 'snap_clearState',
        params: {},
      });

      expect(clearSnapState).not.toHaveBeenCalled();
      expect(response).toStrictEqual({
        jsonrpc: '2.0',
        id: 1,
        error: {
          code: errorCodes.provider.unauthorized,
          message:
            'The requested account and/or method has not been authorized by the user.',
          stack: expect.any(String),
        },
      });
    });

    it('throws if the parameters are invalid', async () => {
      const { implementation } = clearStateHandler;

      const clearSnapState = jest.fn();
      const hasPermission = jest.fn().mockReturnValue(true);

      const hooks = {
        clearSnapState,
        hasPermission,
      };

      const engine = new JsonRpcEngine();

      engine.push((request, response, next, end) => {
        const result = implementation(
          request as JsonRpcRequest<ClearStateParameters>,
          response as PendingJsonRpcResponse<ClearStateResult>,
          next,
          end,
          hooks,
        );

        result?.catch(end);
      });

      const response = await engine.handle({
        jsonrpc: '2.0',
        id: 1,
        method: 'snap_clearState',
        params: {
          encrypted: 'foo',
        },
      });

      expect(response).toStrictEqual({
        jsonrpc: '2.0',
        id: 1,
        error: {
          code: errorCodes.rpc.invalidParams,
          message:
            'Invalid params: At path: encrypted -- Expected a value of type `boolean`, but received: `"foo"`.',
          stack: expect.any(String),
        },
      });
    });
  });
});

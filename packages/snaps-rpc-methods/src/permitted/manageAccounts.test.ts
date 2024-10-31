import { JsonRpcEngine } from '@metamask/json-rpc-engine';
import { rpcErrors } from '@metamask/rpc-errors';
import type { ManageAccountsResult } from '@metamask/snaps-sdk';
import type {
  JsonRpcFailure,
  JsonRpcRequest,
  PendingJsonRpcResponse,
} from '@metamask/utils';

import type { ManageAccountsParameters } from './manageAccounts';
import { manageAccountsHandler } from './manageAccounts';

describe('snap_manageAccounts', () => {
  describe('manageAccountsHandler', () => {
    it('has the expected shape', () => {
      expect(manageAccountsHandler).toMatchObject({
        methodNames: ['snap_manageAccounts'],
        implementation: expect.any(Function),
        hookNames: {
          hasPermission: true,
          handleKeyringSnapMessage: true,
        },
      });
    });
  });

  describe('implementation', () => {
    it('returns the result from the `handleKeyringSnapMessage` hook', async () => {
      const { implementation } = manageAccountsHandler;

      const hasPermission = jest.fn().mockReturnValue(true);
      const handleKeyringSnapMessage = jest.fn().mockReturnValue('foo');

      const hooks = {
        hasPermission,
        handleKeyringSnapMessage,
      };

      const engine = new JsonRpcEngine();

      engine.push((request, response, next, end) => {
        const result = implementation(
          request as JsonRpcRequest<ManageAccountsParameters>,
          response as PendingJsonRpcResponse<ManageAccountsResult>,
          next,
          end,
          hooks,
        );

        result?.catch(end);
      });

      const response = await engine.handle({
        jsonrpc: '2.0',
        id: 1,
        method: 'snap_manageAccounts',
        params: {
          method: 'foo',
          params: { bar: 'baz' },
        },
      });

      expect(handleKeyringSnapMessage).toHaveBeenCalledWith({
        method: 'foo',
        params: { bar: 'baz' },
      });

      expect(response).toStrictEqual({ jsonrpc: '2.0', id: 1, result: 'foo' });
    });

    it('throws an error if the snap does not have permission', async () => {
      const { implementation } = manageAccountsHandler;

      const hasPermission = jest.fn().mockReturnValue(false);
      const handleKeyringSnapMessage = jest.fn().mockReturnValue('foo');

      const hooks = {
        hasPermission,
        handleKeyringSnapMessage,
      };

      const engine = new JsonRpcEngine();

      engine.push((request, response, next, end) => {
        const result = implementation(
          request as JsonRpcRequest<ManageAccountsParameters>,
          response as PendingJsonRpcResponse<ManageAccountsResult>,
          next,
          end,
          hooks,
        );

        result?.catch(end);
      });

      const response = (await engine.handle({
        jsonrpc: '2.0',
        id: 1,
        method: 'snap_manageAccounts',
        params: {
          method: 'foo',
          params: { bar: 'baz' },
        },
      })) as JsonRpcFailure;

      expect(response.error).toStrictEqual({
        ...rpcErrors.methodNotFound().serialize(),
        stack: expect.any(String),
      });
    });

    it('throws an error if the `handleKeyringSnapMessage` hook throws', async () => {
      const { implementation } = manageAccountsHandler;

      const hasPermission = jest.fn().mockReturnValue(true);
      const handleKeyringSnapMessage = jest
        .fn()
        .mockRejectedValue(new Error('foo'));

      const hooks = {
        hasPermission,
        handleKeyringSnapMessage,
      };

      const engine = new JsonRpcEngine();

      engine.push((request, response, next, end) => {
        const result = implementation(
          request as JsonRpcRequest<ManageAccountsParameters>,
          response as PendingJsonRpcResponse<ManageAccountsResult>,
          next,
          end,
          hooks,
        );

        result?.catch(end);
      });

      const response = (await engine.handle({
        jsonrpc: '2.0',
        id: 1,
        method: 'snap_manageAccounts',
        params: {
          method: 'foo',
          params: { bar: 'baz' },
        },
      })) as JsonRpcFailure;

      expect(response.error).toStrictEqual({
        code: -32603,
        message: 'foo',
        data: {
          cause: {
            message: 'foo',
            stack: expect.any(String),
          },
        },
      });
    });

    it('throws on invalid params', async () => {
      const { implementation } = manageAccountsHandler;

      const hasPermission = jest.fn().mockReturnValue(true);
      const handleKeyringSnapMessage = jest.fn().mockReturnValue('foo');

      const hooks = {
        hasPermission,
        handleKeyringSnapMessage,
      };

      const engine = new JsonRpcEngine();

      engine.push((request, response, next, end) => {
        const result = implementation(
          request as JsonRpcRequest<ManageAccountsParameters>,
          response as PendingJsonRpcResponse<ManageAccountsResult>,
          next,
          end,
          hooks,
        );

        result?.catch(end);
      });

      const response = await engine.handle({
        jsonrpc: '2.0',
        id: 1,
        method: 'snap_manageAccounts',
        params: {
          method: 'foo',
          params: 42,
        },
      });

      expect(response).toStrictEqual({
        jsonrpc: '2.0',
        id: 1,
        error: {
          code: -32602,
          message:
            'Invalid params: At path: params -- Expected the value to satisfy a union of `array | record`, but received: 42.',
          stack: expect.any(String),
        },
      });
    });
  });
});

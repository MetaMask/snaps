import { HandlerType } from '@metamask/snaps-utils';
import { MOCK_SNAP_ID, getSnapObject } from '@metamask/snaps-utils/test-utils';
import type { JsonRpcRequest, PendingJsonRpcResponse } from '@metamask/types';
import { ethErrors } from 'eth-rpc-errors';
import type { JsonRpcFailure, JsonRpcSuccess } from 'json-rpc-engine';
import { JsonRpcEngine } from 'json-rpc-engine';

import { invokeKeyringHandler } from './invokeKeyring';

describe('wallet_invokeKeyring', () => {
  describe('invokeKeyringHandler', () => {
    it('has the expected shape', () => {
      expect(invokeKeyringHandler).toMatchObject({
        methodNames: ['wallet_invokeKeyring'],
        implementation: expect.any(Function),
        hookNames: {
          getSnap: true,
          handleSnapRpcRequest: true,
          hasPermission: true,
        },
      });
    });
  });
  describe('invokeKeyringImplementation', () => {
    const getMockHooks = () =>
      ({
        getSnap: jest.fn(),
        hasPermission: jest.fn(),
        handleSnapRpcRequest: jest.fn(),
      } as any);

    it('invokes the snap and returns the result', async () => {
      const { implementation } = invokeKeyringHandler;

      const hooks = getMockHooks();

      hooks.hasPermission.mockImplementation(() => true);
      hooks.getSnap.mockImplementation(() => getSnapObject());
      hooks.handleSnapRpcRequest.mockImplementation(() => 'bar');

      const engine = new JsonRpcEngine();
      engine.push((req, res, next, end) => {
        const result = implementation(
          req as JsonRpcRequest<unknown>,
          res as PendingJsonRpcResponse<unknown>,
          next,
          end,
          hooks,
        );

        result?.catch(end);
      });

      const response = (await engine.handle({
        jsonrpc: '2.0',
        id: 1,
        method: 'wallet_invokeKeyring',
        params: {
          snapId: MOCK_SNAP_ID,
          request: { method: 'foo' },
        },
        origin: 'metamask.io',
      })) as JsonRpcSuccess<string>;

      expect(response.result).toBe('bar');
      expect(hooks.handleSnapRpcRequest).toHaveBeenCalledWith({
        handler: HandlerType.OnKeyringRequest,
        origin: 'metamask.io',
        request: { method: 'foo' },
        snapId: MOCK_SNAP_ID,
      });
    });

    it('fails if invoking the snap fails', async () => {
      const { implementation } = invokeKeyringHandler;

      const hooks = getMockHooks();

      hooks.hasPermission.mockImplementation(() => true);
      hooks.getSnap.mockImplementation(() => getSnapObject());
      hooks.handleSnapRpcRequest.mockImplementation(() => {
        throw ethErrors.rpc.invalidRequest({
          message: 'Failed to start snap.',
        });
      });

      const engine = new JsonRpcEngine();
      engine.push((req, res, next, end) => {
        const result = implementation(
          req as JsonRpcRequest<unknown>,
          res as PendingJsonRpcResponse<unknown>,
          next,
          end,
          hooks,
        );

        result?.catch(end);
      });

      const response = (await engine.handle({
        jsonrpc: '2.0',
        id: 1,
        method: 'wallet_invokeKeyring',
        params: {
          snapId: MOCK_SNAP_ID,
          request: { method: 'foo' },
        },
        origin: 'metamask.io',
      })) as JsonRpcSuccess<string>;

      expect(response.error).toStrictEqual({
        ...ethErrors.rpc
          .invalidRequest({
            message: "Failed to start snap.",
          })
          .serialize(),
        stack: expect.any(String),
      });
    });

    it('fails if the origin doesnt have the permission to invoke the snap', async () => {
      const { implementation } = invokeKeyringHandler;

      const hooks = getMockHooks();

      hooks.hasPermission.mockImplementation(() => false);

      const engine = new JsonRpcEngine();
      engine.push((req, res, next, end) => {
        const result = implementation(
          req as JsonRpcRequest<unknown>,
          res as PendingJsonRpcResponse<unknown>,
          next,
          end,
          hooks,
        );

        result?.catch(end);
      });

      const response = (await engine.handle({
        jsonrpc: '2.0',
        id: 1,
        method: 'wallet_invokeKeyring',
        params: {
          snapId: MOCK_SNAP_ID,
          request: { method: 'foo' },
        },
        origin: 'metamask.io',
      })) as JsonRpcFailure;

      expect(response.error).toStrictEqual({
        ...ethErrors.rpc
          .invalidRequest({
            message: `The snap "${MOCK_SNAP_ID}" is not connected to "metamask.io". Please connect before invoking the snap.`,
          })
          .serialize(),
        stack: expect.any(String),
      });
    });

    it('fails if the snap is not installed', async () => {
      const { implementation } = invokeKeyringHandler;

      const hooks = getMockHooks();

      hooks.hasPermission.mockImplementation(() => true);
      hooks.getSnap.mockImplementation(() => undefined);

      const engine = new JsonRpcEngine();
      engine.push((req, res, next, end) => {
        const result = implementation(
          req as JsonRpcRequest<unknown>,
          res as PendingJsonRpcResponse<unknown>,
          next,
          end,
          hooks,
        );

        result?.catch(end);
      });

      const response = (await engine.handle({
        jsonrpc: '2.0',
        id: 1,
        method: 'wallet_invokeKeyring',
        params: {
          snapId: MOCK_SNAP_ID,
          request: { method: 'foo' },
        },
        origin: 'metamask.io',
      })) as JsonRpcFailure;

      expect(response.error).toStrictEqual({
        ...ethErrors.rpc
          .invalidRequest({
            message: `The snap "${MOCK_SNAP_ID}" is not installed. Please install it first, before invoking the snap.`,
          })
          .serialize(),
        stack: expect.any(String),
      });
    });

    it('fails if params are invalid', async () => {
      const { implementation } = invokeKeyringHandler;

      const hooks = getMockHooks();

      const engine = new JsonRpcEngine();
      engine.push((req, res, next, end) => {
        const result = implementation(
          req as JsonRpcRequest<unknown>,
          res as PendingJsonRpcResponse<unknown>,
          next,
          end,
          hooks,
        );

        result?.catch(end);
      });

      const response = (await engine.handle({
        jsonrpc: '2.0',
        id: 1,
        method: 'wallet_invokeKeyring',
        params: {
          snapId: undefined,
          request: [],
        },
      })) as JsonRpcFailure;

      expect(response.error).toStrictEqual({
        ...ethErrors.rpc
          .invalidParams({
            message: 'Must specify a valid snap ID.',
          })
          .serialize(),
        stack: expect.any(String),
      });
    });
  });
});

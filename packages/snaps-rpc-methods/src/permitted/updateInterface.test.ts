import { JsonRpcEngine } from '@metamask/json-rpc-engine';
import { text, type UpdateInterfaceResult } from '@metamask/snaps-sdk';
import { MOCK_SNAP_ID } from '@metamask/snaps-utils/test-utils';
import type { PendingJsonRpcResponse } from '@metamask/utils';

import { updateInterfaceHandler } from './updateInterface';

describe('snap_updateInterface', () => {
  describe('updateInterfaceHandler', () => {
    it('has the expected shape', () => {
      expect(updateInterfaceHandler).toMatchObject({
        methodNames: ['snap_updateInterface'],
        implementation: expect.any(Function),
        hookNames: {
          updateInterface: true,
          hasPermission: true,
        },
      });
    });
  });

  describe('implementation', () => {
    it('returns the result from the `updateInterface` hook', async () => {
      const { implementation } = updateInterfaceHandler;

      const updateInterface = jest.fn();
      const hasPermission = jest.fn().mockReturnValue(true);

      const hooks = {
        updateInterface,
        hasPermission,
      };

      const engine = new JsonRpcEngine();

      engine.push((request, response, next, end) => {
        const result = implementation(
          // @ts-expect-error - `origin` is not part of the type, but in practice
          // it is added by the MetaMask middleware stack.
          { ...request, origin: MOCK_SNAP_ID },
          response as PendingJsonRpcResponse<UpdateInterfaceResult>,
          next,
          end,
          hooks,
        );

        result?.catch(end);
      });

      const response = await engine.handle({
        jsonrpc: '2.0',
        id: 1,
        method: 'snap_updateInterface',
        params: {
          id: 'foo',
          ui: text('foo'),
        },
      });

      expect(response).toStrictEqual({ jsonrpc: '2.0', id: 1, result: null });
    });
  });

  it('throws if the the snap is not allowed', async () => {
    const { implementation } = updateInterfaceHandler;

    const updateInterface = jest.fn();
    const hasPermission = jest.fn().mockReturnValue(false);

    const hooks = {
      updateInterface,
      hasPermission,
    };

    const engine = new JsonRpcEngine();

    engine.push((request, response, next, end) => {
      const result = implementation(
        // @ts-expect-error - `origin` is not part of the type, but in practice
        // it is added by the MetaMask middleware stack.
        { ...request, origin: MOCK_SNAP_ID },
        response as PendingJsonRpcResponse<UpdateInterfaceResult>,
        next,
        end,
        hooks,
      );

      result?.catch(end);
    });

    const response = await engine.handle({
      jsonrpc: '2.0',
      id: 1,
      method: 'snap_updateInterface',
      params: {
        id: 'foo',
      },
    });

    expect(response).toStrictEqual({
      jsonrpc: '2.0',
      id: 1,
      error: expect.objectContaining({
        code: -32601,
        message: 'The method does not exist / is not available.',
      }),
    });
  });

  it('throws on invalid params', async () => {
    const { implementation } = updateInterfaceHandler;

    const updateInterface = jest.fn();
    const hasPermission = jest.fn().mockReturnValue(true);

    const hooks = {
      updateInterface,
      hasPermission,
    };

    const engine = new JsonRpcEngine();

    engine.push((request, response, next, end) => {
      const result = implementation(
        // @ts-expect-error - `origin` is not part of the type, but in practice
        // it is added by the MetaMask middleware stack.
        { ...request, origin: MOCK_SNAP_ID },
        response as PendingJsonRpcResponse<UpdateInterfaceResult>,
        next,
        end,
        hooks,
      );

      result?.catch(end);
    });

    const response = await engine.handle({
      jsonrpc: '2.0',
      id: 1,
      method: 'snap_updateInterface',
      params: {
        id: 42,
      },
    });

    expect(response).toStrictEqual({
      error: {
        code: -32602,
        message:
          'Invalid params: At path: id -- Expected a string, but received: 42.',
        stack: expect.any(String),
      },
      id: 1,
      jsonrpc: '2.0',
    });
  });
});

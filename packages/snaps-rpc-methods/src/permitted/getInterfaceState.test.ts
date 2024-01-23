import { JsonRpcEngine } from '@metamask/json-rpc-engine';
import { type GetInterfaceStateResult } from '@metamask/snaps-sdk';
import type { JsonRpcRequest, PendingJsonRpcResponse } from '@metamask/utils';

import { getInterfaceStateHandler } from './getInterfaceState';
import type { UpdateInterfaceParameters } from './updateInterface';

describe('snap_getInterfaceState', () => {
  describe('getInterfaceStateHandler', () => {
    it('has the expected shape', () => {
      expect(getInterfaceStateHandler).toMatchObject({
        methodNames: ['snap_getInterfaceState'],
        implementation: expect.any(Function),
        hookNames: {
          getInterfaceState: true,
        },
      });
    });
  });

  describe('implementation', () => {
    it('returns the result from the `getInterfaceState` hook', async () => {
      const { implementation } = getInterfaceStateHandler;

      const getInterfaceState = jest.fn().mockReturnValue({ foo: 'bar' });

      const hooks = {
        getInterfaceState,
      };

      const engine = new JsonRpcEngine();

      engine.push((request, response, next, end) => {
        const result = implementation(
          request as JsonRpcRequest<UpdateInterfaceParameters>,
          response as PendingJsonRpcResponse<GetInterfaceStateResult>,
          next,
          end,
          hooks,
        );

        result?.catch(end);
      });

      const response = await engine.handle({
        jsonrpc: '2.0',
        id: 1,
        method: 'snap_getInterfaceState',
        params: {
          id: 'foo',
        },
      });

      expect(response).toStrictEqual({
        jsonrpc: '2.0',
        id: 1,
        result: { foo: 'bar' },
      });
    });

    it('throws on invalid params', async () => {
      const { implementation } = getInterfaceStateHandler;

      const getInterfaceState = jest.fn().mockReturnValue({ foo: 'bar' });

      const hooks = {
        getInterfaceState,
      };

      const engine = new JsonRpcEngine();

      engine.push((request, response, next, end) => {
        const result = implementation(
          request as JsonRpcRequest<UpdateInterfaceParameters>,
          response as PendingJsonRpcResponse<GetInterfaceStateResult>,
          next,
          end,
          hooks,
        );

        result?.catch(end);
      });

      const response = await engine.handle({
        jsonrpc: '2.0',
        id: 1,
        method: 'snap_getInterfaceState',
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
});

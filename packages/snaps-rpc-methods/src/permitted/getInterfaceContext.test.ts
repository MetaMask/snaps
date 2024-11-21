import { JsonRpcEngine } from '@metamask/json-rpc-engine';
import { type GetInterfaceContextResult } from '@metamask/snaps-sdk';
import type { JsonRpcRequest, PendingJsonRpcResponse } from '@metamask/utils';

import type { GetInterfaceContextParameters } from './getInterfaceContext';
import { getInterfaceContextHandler } from './getInterfaceContext';

describe('snap_getInterfaceContext', () => {
  describe('getInterfaceContextHandler', () => {
    it('has the expected shape', () => {
      expect(getInterfaceContextHandler).toMatchObject({
        methodNames: ['snap_getInterfaceContext'],
        implementation: expect.any(Function),
        hookNames: {
          getInterfaceContext: true,
        },
      });
    });
  });

  describe('implementation', () => {
    it('returns the result from the `getInterfaceContext` hook', async () => {
      const { implementation } = getInterfaceContextHandler;

      const getInterfaceContext = jest.fn().mockReturnValue({ foo: 'bar' });

      const hooks = {
        getInterfaceContext,
      };

      const engine = new JsonRpcEngine();

      engine.push((request, response, next, end) => {
        const result = implementation(
          request as JsonRpcRequest<GetInterfaceContextParameters>,
          response as PendingJsonRpcResponse<GetInterfaceContextResult>,
          next,
          end,
          hooks,
        );

        result?.catch(end);
      });

      const response = await engine.handle({
        jsonrpc: '2.0',
        id: 1,
        method: 'snap_getInterfaceContext',
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
      const { implementation } = getInterfaceContextHandler;

      const getInterfaceContext = jest.fn().mockReturnValue({ foo: 'bar' });

      const hooks = {
        getInterfaceContext,
      };

      const engine = new JsonRpcEngine();

      engine.push((request, response, next, end) => {
        const result = implementation(
          request as JsonRpcRequest<GetInterfaceContextParameters>,
          response as PendingJsonRpcResponse<GetInterfaceContextResult>,
          next,
          end,
          hooks,
        );

        result?.catch(end);
      });

      const response = await engine.handle({
        jsonrpc: '2.0',
        id: 1,
        method: 'snap_getInterfaceContext',
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

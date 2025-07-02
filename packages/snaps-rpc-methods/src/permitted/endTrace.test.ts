import { JsonRpcEngine } from '@metamask/json-rpc-engine';
import type { EndTraceParams, EndTraceResult } from '@metamask/snaps-sdk';
import type { JsonRpcRequest, PendingJsonRpcResponse } from '@metamask/utils';

import { endTraceHandler } from './endTrace';

describe('snap_endTrace', () => {
  describe('endTraceHandler', () => {
    it('has the expected shape', () => {
      expect(endTraceHandler).toMatchObject({
        methodNames: ['snap_endTrace'],
        implementation: expect.any(Function),
        hookNames: {
          endTrace: true,
          getSnap: true,
        },
      });
    });
  });

  describe('implementation', () => {
    it('calls the `endTrace` hook with the provided parameters', async () => {
      const { implementation } = endTraceHandler;

      const endTrace = jest.fn().mockReturnValue(null);

      const getSnap = jest.fn().mockReturnValue({ preinstalled: true });
      const hooks = { endTrace, getSnap };

      const engine = new JsonRpcEngine();

      engine.push((request, response, next, end) => {
        const result = implementation(
          request as JsonRpcRequest<EndTraceParams>,
          response as PendingJsonRpcResponse<EndTraceResult>,
          next,
          end,
          hooks,
        );

        result?.catch(end);
      });

      const response = await engine.handle({
        jsonrpc: '2.0',
        id: 1,
        method: 'snap_endTrace',
        params: {
          id: 'test-id',
          name: 'Test Trace',
          timestamp: 1234567890,
        },
      });

      expect(response).toStrictEqual({
        jsonrpc: '2.0',
        id: 1,
        result: null,
      });

      expect(endTrace).toHaveBeenCalledWith({
        id: 'test-id',
        name: 'Test Trace',
        timestamp: 1234567890,
      });
    });

    it('throws an error if the Snap is not preinstalled', async () => {
      const { implementation } = endTraceHandler;

      const endTrace = jest.fn();
      const getSnap = jest.fn().mockReturnValue({ preinstalled: false });
      const hooks = { endTrace, getSnap };

      const engine = new JsonRpcEngine();

      engine.push((request, response, next, end) => {
        const result = implementation(
          request as JsonRpcRequest<EndTraceParams>,
          response as PendingJsonRpcResponse<EndTraceResult>,
          next,
          end,
          hooks,
        );

        result?.catch(end);
      });

      const response = await engine.handle({
        jsonrpc: '2.0',
        id: 1,
        method: 'snap_endTrace',
        params: {
          id: 'test-id',
          name: 'Test Trace',
        },
      });

      expect(endTrace).not.toHaveBeenCalled();
      expect(response).toStrictEqual({
        jsonrpc: '2.0',
        id: 1,
        error: {
          code: -32601,
          message: 'The method does not exist / is not available.',
          stack: expect.any(String),
        },
      });
    });

    it.each([
      [
        { foo: 'bar' },
        'Invalid params: At path: name -- Expected a string, but received: undefined.',
      ],
      [
        { name: undefined },
        'Invalid params: At path: name -- Expected a string, but received: undefined.',
      ],
      [
        { name: 'Test Trace', id: 123 },
        'Invalid params: At path: id -- Expected a string, but received: 123.',
      ],
      [
        { name: 'Test Trace', id: 'test-id', timestamp: 'not-a-number' },
        'Invalid params: At path: timestamp -- Expected a number, but received: "not-a-number".',
      ],
    ])(
      'throws an error if the parameters are invalid',
      async (params, error) => {
        const { implementation } = endTraceHandler;

        const endTrace = jest.fn();
        const getSnap = jest.fn().mockReturnValue({ preinstalled: true });
        const hooks = { endTrace, getSnap };

        const engine = new JsonRpcEngine();

        engine.push((request, response, next, end) => {
          const result = implementation(
            request as JsonRpcRequest<EndTraceParams>,
            response as PendingJsonRpcResponse<EndTraceResult>,
            next,
            end,
            hooks,
          );

          result?.catch(end);
        });

        // @ts-expect-error: Intentionally passing invalid params.
        // eslint-disable-next-line @typescript-eslint/await-thenable
        const response = await engine.handle({
          jsonrpc: '2.0',
          id: 1,
          method: 'snap_endTrace',
          params,
        });

        expect(endTrace).not.toHaveBeenCalled();
        expect(response).toStrictEqual({
          jsonrpc: '2.0',
          id: 1,
          error: {
            code: -32602,
            message: error,
            stack: expect.any(String),
          },
        });
      },
    );
  });
});

import { JsonRpcEngine } from '@metamask/json-rpc-engine';
import type { StartTraceParams } from '@metamask/snaps-sdk';
import type { JsonRpcRequest } from '@metamask/utils';

import { startTraceHandler } from './startTrace';

describe('snap_startTrace', () => {
  describe('startTraceHandler', () => {
    it('has the expected shape', () => {
      expect(startTraceHandler).toMatchObject({
        methodNames: ['snap_startTrace'],
        implementation: expect.any(Function),
        hookNames: {
          startTrace: true,
          getSnap: true,
        },
      });
    });
  });

  describe('implementation', () => {
    it('calls the `startTrace` hook with the provided parameters', async () => {
      const { implementation } = startTraceHandler;

      const startTrace = jest.fn().mockReturnValue({
        traceId: 'test-trace-id',
      });

      const getSnap = jest.fn().mockReturnValue({ preinstalled: true });
      const hooks = { startTrace, getSnap };

      const engine = new JsonRpcEngine();

      engine.push((request, response, next, end) => {
        const result = implementation(
          request as JsonRpcRequest<StartTraceParams>,
          response,
          next,
          end,
          hooks,
        );

        result?.catch(end);
      });

      const response = await engine.handle({
        jsonrpc: '2.0',
        id: 1,
        method: 'snap_startTrace',
        params: {
          id: 'test-id',
          name: 'Test Trace',
          data: { foo: 'bar' },
          tags: { tag1: 'value1', tag2: 42 },
          startTime: 1234567890,
        },
      });

      expect(response).toStrictEqual({
        jsonrpc: '2.0',
        id: 1,
        result: {
          traceId: 'test-trace-id',
        },
      });

      expect(startTrace).toHaveBeenCalledWith({
        id: 'test-id',
        name: 'Test Trace',
        data: { foo: 'bar' },
        tags: { tag1: 'value1', tag2: 42 },
        startTime: 1234567890,
      });
    });

    it('throws an error if the Snap is not preinstalled', async () => {
      const { implementation } = startTraceHandler;

      const startTrace = jest.fn();
      const getSnap = jest.fn().mockReturnValue({ preinstalled: false });
      const hooks = { startTrace, getSnap };

      const engine = new JsonRpcEngine();

      engine.push((request, response, next, end) => {
        const result = implementation(
          request as JsonRpcRequest<StartTraceParams>,
          response,
          next,
          end,
          hooks,
        );

        result?.catch(end);
      });

      const response = await engine.handle({
        jsonrpc: '2.0',
        id: 1,
        method: 'snap_startTrace',
        params: {
          id: 'test-id',
          name: 'Test Trace',
          data: { foo: 'bar' },
          tags: { tag1: 'value1', tag2: 42 },
          startTime: 1234567890,
        },
      });

      expect(startTrace).not.toHaveBeenCalled();
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
        { name: 'Test Trace', id: 'test-id', data: 'not-an-object' },
        'Invalid params: At path: data -- Expected an object, but received: "not-an-object".',
      ],
      [
        { name: 'Test Trace', id: 'test-id', tags: 'not-an-object' },
        'Invalid params: At path: tags -- Expected an object, but received: "not-an-object".',
      ],
    ])(
      'throws an error if the parameters are invalid',
      async (params, error) => {
        const { implementation } = startTraceHandler;

        const startTrace = jest.fn();
        const getSnap = jest.fn().mockReturnValue({ preinstalled: true });
        const hooks = { startTrace, getSnap };

        const engine = new JsonRpcEngine();

        engine.push((request, response, next, end) => {
          const result = implementation(
            request as JsonRpcRequest<StartTraceParams>,
            response,
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
          method: 'snap_startTrace',
          params,
        });

        expect(startTrace).not.toHaveBeenCalled();
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

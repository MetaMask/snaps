import { JsonRpcEngine } from '@metamask/json-rpc-engine';
import type { TrackErrorParams, TrackErrorResult } from '@metamask/snaps-sdk';
import { getJsonError } from '@metamask/snaps-sdk';
import type { JsonRpcRequest, PendingJsonRpcResponse } from '@metamask/utils';

import { trackErrorHandler } from './trackError';

describe('snap_trackError', () => {
  describe('trackErrorHandler', () => {
    it('has the expected shape', () => {
      expect(trackErrorHandler).toMatchObject({
        methodNames: ['snap_trackError'],
        implementation: expect.any(Function),
        hookNames: {
          trackError: true,
          getSnap: true,
        },
      });
    });
  });

  describe('implementation', () => {
    it('tracks an error with a name, message, and stack', async () => {
      const { implementation } = trackErrorHandler;

      const trackError = jest.fn().mockReturnValue('test-id');
      const getSnap = jest.fn().mockReturnValue({ preinstalled: true });
      const hooks = { trackError, getSnap };

      const engine = new JsonRpcEngine();

      engine.push((request, response, next, end) => {
        const result = implementation(
          request as JsonRpcRequest<TrackErrorParams>,
          response as PendingJsonRpcResponse<TrackErrorResult>,
          next,
          end,
          hooks,
        );

        result?.catch(end);
      });

      const response = await engine.handle({
        jsonrpc: '2.0',
        id: 1,
        method: 'snap_trackError',
        params: {
          error: {
            name: 'TestError',
            message: 'This is a test error.',
            stack:
              'Error: This is a test error\n    at Object.<anonymous> (test.js:1:1)',
            cause: null,
          },
        },
      });

      expect(response).toStrictEqual({
        jsonrpc: '2.0',
        id: 1,
        result: 'test-id',
      });

      expect(trackError.mock.calls[0][0]).toBeInstanceOf(Error);
      expect(trackError).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'TestError',
          message: 'This is a test error.',
          stack:
            'Error: This is a test error\n    at Object.<anonymous> (test.js:1:1)',
        }),
      );
    });

    it('tracks an error with a name, message, stack, and cause', async () => {
      const { implementation } = trackErrorHandler;

      const trackError = jest.fn().mockReturnValue('test-id');
      const getSnap = jest.fn().mockReturnValue({ preinstalled: true });
      const hooks = { trackError, getSnap };

      const engine = new JsonRpcEngine();

      engine.push((request, response, next, end) => {
        const result = implementation(
          request as JsonRpcRequest<TrackErrorParams>,
          response as PendingJsonRpcResponse<TrackErrorResult>,
          next,
          end,
          hooks,
        );

        result?.catch(end);
      });

      const response = await engine.handle({
        jsonrpc: '2.0',
        id: 1,
        method: 'snap_trackError',
        params: {
          error: {
            name: 'TestError',
            message: 'This is a test error.',
            stack:
              'Error: This is a test error\n    at Object.<anonymous> (test.js:1:1)',
            cause: {
              name: 'TestCauseError',
              message: 'This is a test cause error.',
              stack:
                'TestCauseError: This is a test cause error.\n    at Object.<anonymous> (cause.js:1:1)',
              cause: null,
            },
          },
        },
      });

      expect(response).toStrictEqual({
        jsonrpc: '2.0',
        id: 1,
        result: 'test-id',
      });

      expect(trackError.mock.calls[0][0]).toBeInstanceOf(Error);
      expect(trackError.mock.calls[0][0].cause).toBeInstanceOf(Error);
      expect(trackError).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'TestError',
          message: 'This is a test error.',
          stack:
            'Error: This is a test error\n    at Object.<anonymous> (test.js:1:1)',
          cause: expect.objectContaining({
            name: 'TestCauseError',
            message: 'This is a test cause error.',
            stack:
              'TestCauseError: This is a test cause error.\n    at Object.<anonymous> (cause.js:1:1)',
          }),
        }),
      );
    });

    it('tracks an error with a name, and message', async () => {
      const { implementation } = trackErrorHandler;

      const trackError = jest.fn().mockReturnValue('test-id');
      const getSnap = jest.fn().mockReturnValue({ preinstalled: true });
      const hooks = { trackError, getSnap };

      const engine = new JsonRpcEngine();

      engine.push((request, response, next, end) => {
        const result = implementation(
          request as JsonRpcRequest<TrackErrorParams>,
          response as PendingJsonRpcResponse<TrackErrorResult>,
          next,
          end,
          hooks,
        );

        result?.catch(end);
      });

      const response = await engine.handle({
        jsonrpc: '2.0',
        id: 1,
        method: 'snap_trackError',
        params: {
          error: {
            name: 'TestError',
            message: 'This is a test error.',
            stack: null,
            cause: null,
          },
        },
      });

      expect(response).toStrictEqual({
        jsonrpc: '2.0',
        id: 1,
        result: 'test-id',
      });

      expect(trackError.mock.calls[0][0]).toBeInstanceOf(Error);
      expect(trackError).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'TestError',
          message: 'This is a test error.',
          stack: undefined,
        }),
      );
    });

    it('tracks an error with the error helper', async () => {
      const { implementation } = trackErrorHandler;

      const trackError = jest.fn().mockReturnValue('test-id');
      const getSnap = jest.fn().mockReturnValue({ preinstalled: true });
      const hooks = { trackError, getSnap };

      const engine = new JsonRpcEngine();

      engine.push((request, response, next, end) => {
        const result = implementation(
          request as JsonRpcRequest<TrackErrorParams>,
          response as PendingJsonRpcResponse<TrackErrorResult>,
          next,
          end,
          hooks,
        );

        result?.catch(end);
      });

      const error = new Error('This is a test error.');
      error.name = 'TestError';

      const response = await engine.handle({
        jsonrpc: '2.0',
        id: 1,
        method: 'snap_trackError',
        params: {
          error: getJsonError(error),
        },
      });

      expect(response).toStrictEqual({
        jsonrpc: '2.0',
        id: 1,
        result: 'test-id',
      });

      expect(trackError.mock.calls[0][0]).toBeInstanceOf(Error);
      expect(trackError).toHaveBeenCalledWith(
        expect.objectContaining({
          name: error.name,
          message: error.message,
          stack: error.stack,
        }),
      );
    });

    it('throws an error if the Snap is not preinstalled', async () => {
      const { implementation } = trackErrorHandler;

      const trackError = jest.fn();
      const getSnap = jest.fn().mockReturnValue({ preinstalled: false });
      const hooks = { trackError, getSnap };

      const engine = new JsonRpcEngine();

      engine.push((request, response, next, end) => {
        const result = implementation(
          request as JsonRpcRequest<TrackErrorParams>,
          response as PendingJsonRpcResponse<TrackErrorResult>,
          next,
          end,
          hooks,
        );

        result?.catch(end);
      });

      const response = await engine.handle({
        jsonrpc: '2.0',
        id: 1,
        method: 'snap_trackError',
        params: {
          error: {
            name: 'TestError',
            message: 'This is a test error.',
            stack:
              'Error: This is a test error\n    at Object.<anonymous> (test.js:1:1)',
          },
        },
      });

      expect(trackError).not.toHaveBeenCalled();
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
        'Invalid params: At path: error -- Expected an object, but received: undefined.',
      ],
      [
        { error: {} },
        'Invalid params: At path: error.name -- Expected a string, but received: undefined.',
      ],
      [
        { error: { name: 'TestError' } },
        'Invalid params: At path: error.message -- Expected a string, but received: undefined.',
      ],
      [
        { error: { name: 'TestError', message: 'This is a test error.' } },
        'Invalid params: At path: error.stack -- Expected a string, but received: undefined.',
      ],
    ])(
      'throws an error if the parameters are invalid',
      async (params, error) => {
        const { implementation } = trackErrorHandler;

        const trackError = jest.fn();
        const getSnap = jest.fn().mockReturnValue({ preinstalled: true });
        const hooks = { trackError, getSnap };

        const engine = new JsonRpcEngine();

        engine.push((request, response, next, end) => {
          const result = implementation(
            request as JsonRpcRequest<TrackErrorParams>,
            response as PendingJsonRpcResponse<TrackErrorResult>,
            next,
            end,
            hooks,
          );

          result?.catch(end);
        });

        const response = await engine.handle({
          jsonrpc: '2.0',
          id: 1,
          method: 'snap_trackError',
          params,
        });

        expect(trackError).not.toHaveBeenCalled();
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

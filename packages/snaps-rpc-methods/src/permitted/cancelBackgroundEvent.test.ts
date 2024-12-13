import { JsonRpcEngine } from '@metamask/json-rpc-engine';
import type {
  CancelBackgroundEventParams,
  CancelBackgroundEventResult,
} from '@metamask/snaps-sdk';
import { MOCK_SNAP_ID } from '@metamask/snaps-utils/test-utils';
import type { JsonRpcRequest, PendingJsonRpcResponse } from '@metamask/utils';

import { cancelBackgroundEventHandler } from './cancelBackgroundEvent';

describe('snap_cancelBackgroundEvent', () => {
  describe('cancelBackgroundEventHandler', () => {
    it('has the expected shape', () => {
      expect(cancelBackgroundEventHandler).toMatchObject({
        methodNames: ['snap_cancelBackgroundEvent'],
        implementation: expect.any(Function),
        hookNames: {
          cancelBackgroundEvent: true,
        },
      });
    });
  });

  describe('implementation', () => {
    const createOriginMiddleware =
      (origin: string) =>
      (request: any, _response: unknown, next: () => void, _end: unknown) => {
        request.origin = origin;
        next();
      };
    it('returns null after calling the `scheduleBackgroundEvent` hook', async () => {
      const { implementation } = cancelBackgroundEventHandler;

      const cancelBackgroundEvent = jest.fn();
      const hasPermission = jest.fn().mockImplementation(() => true);

      const hooks = {
        cancelBackgroundEvent,
        hasPermission,
      };

      const engine = new JsonRpcEngine();

      engine.push(createOriginMiddleware(MOCK_SNAP_ID));
      engine.push((request, response, next, end) => {
        const result = implementation(
          request as JsonRpcRequest<CancelBackgroundEventParams>,
          response as PendingJsonRpcResponse<CancelBackgroundEventResult>,
          next,
          end,
          hooks,
        );

        result?.catch(end);
      });

      const response = await engine.handle({
        jsonrpc: '2.0',
        id: 1,
        method: 'snap_cancelBackgroundEvent',
        params: {
          id: 'foo',
        },
      });

      expect(response).toStrictEqual({ jsonrpc: '2.0', id: 1, result: null });
    });

    it('cancels a background event', async () => {
      const { implementation } = cancelBackgroundEventHandler;

      const cancelBackgroundEvent = jest.fn();
      const hasPermission = jest.fn().mockImplementation(() => true);

      const hooks = {
        cancelBackgroundEvent,
        hasPermission,
      };

      const engine = new JsonRpcEngine();

      engine.push(createOriginMiddleware(MOCK_SNAP_ID));
      engine.push((request, response, next, end) => {
        const result = implementation(
          request as JsonRpcRequest<CancelBackgroundEventParams>,
          response as PendingJsonRpcResponse<CancelBackgroundEventResult>,
          next,
          end,
          hooks,
        );

        result?.catch(end);
      });

      await engine.handle({
        jsonrpc: '2.0',
        id: 1,
        method: 'snap_cancelBackgroundEvent',
        params: {
          id: 'foo',
        },
      });

      expect(cancelBackgroundEvent).toHaveBeenCalledWith('foo');
    });

    it('throws if a snap does not have the "endowment:cronjob" permission', async () => {
      const { implementation } = cancelBackgroundEventHandler;

      const cancelBackgroundEvent = jest.fn();
      const hasPermission = jest.fn().mockImplementation(() => false);

      const hooks = {
        cancelBackgroundEvent,
        hasPermission,
      };

      const engine = new JsonRpcEngine();

      engine.push(createOriginMiddleware(MOCK_SNAP_ID));
      engine.push((request, response, next, end) => {
        const result = implementation(
          request as JsonRpcRequest<CancelBackgroundEventParams>,
          response as PendingJsonRpcResponse<CancelBackgroundEventResult>,
          next,
          end,
          hooks,
        );

        result?.catch(end);
      });

      const response = await engine.handle({
        jsonrpc: '2.0',
        id: 1,
        method: 'snap_cancelBackgroundEvent',
        params: {
          id: 2,
        },
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

    it('throws on invalid params', async () => {
      const { implementation } = cancelBackgroundEventHandler;

      const cancelBackgroundEvent = jest.fn();
      const hasPermission = jest.fn().mockImplementation(() => true);

      const hooks = {
        cancelBackgroundEvent,
        hasPermission,
      };

      const engine = new JsonRpcEngine();

      engine.push(createOriginMiddleware(MOCK_SNAP_ID));
      engine.push((request, response, next, end) => {
        const result = implementation(
          request as JsonRpcRequest<CancelBackgroundEventParams>,
          response as PendingJsonRpcResponse<CancelBackgroundEventResult>,
          next,
          end,
          hooks,
        );

        result?.catch(end);
      });

      const response = await engine.handle({
        jsonrpc: '2.0',
        id: 1,
        method: 'snap_cancelBackgroundEvent',
        params: {
          id: 2,
        },
      });

      expect(response).toStrictEqual({
        error: {
          code: -32602,
          message:
            'Invalid params: At path: id -- Expected a string, but received: 2.',
          stack: expect.any(String),
        },
        id: 1,
        jsonrpc: '2.0',
      });
    });
  });
});

import { JsonRpcEngine } from '@metamask/json-rpc-engine';
import type {
  CancelBackgroundEventParams,
  CancelBackgroundEventResult,
} from '@metamask/snaps-sdk';
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
    it('returns null after calling the `scheduleBackgroundEvent` hook', async () => {
      const { implementation } = cancelBackgroundEventHandler;

      const cancelBackgroundEvent = jest.fn();

      const hooks = {
        cancelBackgroundEvent,
      };

      const engine = new JsonRpcEngine();

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

      const hooks = {
        cancelBackgroundEvent,
      };

      const engine = new JsonRpcEngine();

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

    it('throws on invalid params', async () => {
      const { implementation } = cancelBackgroundEventHandler;

      const cancelBackgroundEvent = jest.fn();

      const hooks = {
        cancelBackgroundEvent,
      };

      const engine = new JsonRpcEngine();

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

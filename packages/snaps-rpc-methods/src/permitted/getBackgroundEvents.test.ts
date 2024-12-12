import { JsonRpcEngine } from '@metamask/json-rpc-engine';
import type {
  GetBackgroundEventsParams,
  GetBackgroundEventsResult,
} from '@metamask/snaps-sdk';
import { MOCK_SNAP_ID } from '@metamask/snaps-utils/test-utils';
import type { JsonRpcRequest, PendingJsonRpcResponse } from '@metamask/utils';

import { SnapEndowments } from '../endowments';
import { getBackgroundEventsHandler } from './getBackgroundEvents';

describe('snap_getBackgroundEvents', () => {
  describe('getBackgroundEventsHandler', () => {
    it('has the expected shape', () => {
      expect(getBackgroundEventsHandler).toMatchObject({
        methodNames: ['snap_getBackgroundEvents'],
        implementation: expect.any(Function),
        hookNames: {
          getBackgroundEvents: true,
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
    it('returns an array of background events after calling the `getBackgroundEvents` hook', async () => {
      const { implementation } = getBackgroundEventsHandler;

      const backgroundEvents = [
        {
          id: 'foo',
          snapId: MOCK_SNAP_ID,
          date: '2022-01-01T01:00Z',
          scheduledAt: '2021-01-01',
          request: {
            method: 'handleExport',
            params: ['p1'],
          },
        },
      ];

      const getBackgroundEvents = jest
        .fn()
        .mockImplementation(() => backgroundEvents);

      const hasPermission = jest.fn().mockImplementation(() => true);

      const hooks = {
        getBackgroundEvents,
        hasPermission,
      };

      const engine = new JsonRpcEngine();

      engine.push(createOriginMiddleware(MOCK_SNAP_ID));
      engine.push((request, response, next, end) => {
        const result = implementation(
          request as JsonRpcRequest<GetBackgroundEventsParams>,
          response as PendingJsonRpcResponse<GetBackgroundEventsResult>,
          next,
          end,
          hooks,
        );

        result?.catch(end);
      });

      const response = await engine.handle({
        jsonrpc: '2.0',
        id: 1,
        method: 'snap_getBackgroundEvents',
      });

      expect(response).toStrictEqual({
        jsonrpc: '2.0',
        id: 1,
        result: backgroundEvents,
      });
    });

    it('gets background events', async () => {
      const { implementation } = getBackgroundEventsHandler;

      const getBackgroundEvents = jest.fn();

      const hasPermission = jest.fn().mockImplementation(() => true);

      const hooks = {
        getBackgroundEvents,
        hasPermission,
      };

      const engine = new JsonRpcEngine();

      engine.push(createOriginMiddleware(MOCK_SNAP_ID));
      engine.push((request, response, next, end) => {
        const result = implementation(
          request as JsonRpcRequest<GetBackgroundEventsParams>,
          response as PendingJsonRpcResponse<GetBackgroundEventsResult>,
          next,
          end,
          hooks,
        );

        result?.catch(end);
      });

      await engine.handle({
        jsonrpc: '2.0',
        id: 1,
        method: 'snap_getBackgroundEvents',
      });

      expect(getBackgroundEvents).toHaveBeenCalled();
    });

    it('will throw if the call to the `getBackgroundEvents` hook fails', async () => {
      const { implementation } = getBackgroundEventsHandler;

      const getBackgroundEvents = jest.fn().mockImplementation(() => {
        throw new Error('foobar');
      });

      const hasPermission = jest.fn().mockImplementation(() => true);

      const hooks = {
        getBackgroundEvents,
        hasPermission,
      };

      const engine = new JsonRpcEngine();

      engine.push(createOriginMiddleware(MOCK_SNAP_ID));
      engine.push((request, response, next, end) => {
        const result = implementation(
          request as JsonRpcRequest<GetBackgroundEventsParams>,
          response as PendingJsonRpcResponse<GetBackgroundEventsResult>,
          next,
          end,
          hooks,
        );

        result?.catch(end);
      });

      const response = await engine.handle({
        jsonrpc: '2.0',
        id: 1,
        method: 'snap_getBackgroundEvent',
      });

      expect(response).toStrictEqual({
        error: {
          code: -32603,
          data: {
            cause: expect.objectContaining({
              message: 'foobar',
            }),
          },
          message: 'foobar',
        },
        id: 1,
        jsonrpc: '2.0',
      });
    });

    it('throws if a snap does not have the "endowment:cronjob" permission', async () => {
      const { implementation } = getBackgroundEventsHandler;

      const getBackgroundEvents = jest.fn();
      const hasPermission = jest.fn().mockImplementation(() => false);

      const hooks = {
        getBackgroundEvents,
        hasPermission,
      };

      const engine = new JsonRpcEngine();

      engine.push(createOriginMiddleware(MOCK_SNAP_ID));
      engine.push((request, response, next, end) => {
        const result = implementation(
          request as JsonRpcRequest<GetBackgroundEventsParams>,
          response as PendingJsonRpcResponse<GetBackgroundEventsResult>,
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
          code: -32600,
          message: `The snap "${MOCK_SNAP_ID}" does not have the "${SnapEndowments.Cronjob}" permission.`,
          stack: expect.any(String),
        },
        id: 1,
        jsonrpc: '2.0',
      });
    });
  });
});

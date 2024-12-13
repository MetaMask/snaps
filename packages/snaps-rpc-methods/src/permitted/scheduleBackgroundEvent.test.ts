import { JsonRpcEngine } from '@metamask/json-rpc-engine';
import type {
  ScheduleBackgroundEventParams,
  ScheduleBackgroundEventResult,
} from '@metamask/snaps-sdk';
import { MOCK_SNAP_ID } from '@metamask/snaps-utils/test-utils';
import type { JsonRpcRequest, PendingJsonRpcResponse } from '@metamask/utils';

import { SnapEndowments } from '../endowments';
import { scheduleBackgroundEventHandler } from './scheduleBackgroundEvent';

describe('snap_scheduleBackgroundEvent', () => {
  describe('scheduleBackgroundEventHandler', () => {
    it('has the expected shape', () => {
      expect(scheduleBackgroundEventHandler).toMatchObject({
        methodNames: ['snap_scheduleBackgroundEvent'],
        implementation: expect.any(Function),
        hookNames: {
          scheduleBackgroundEvent: true,
          hasPermission: true,
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

    it('returns an id after calling the `scheduleBackgroundEvent` hook', async () => {
      const { implementation } = scheduleBackgroundEventHandler;

      const scheduleBackgroundEvent = jest.fn().mockImplementation(() => 'foo');
      const hasPermission = jest.fn().mockImplementation(() => true);

      const hooks = {
        scheduleBackgroundEvent,
        hasPermission,
      };

      const engine = new JsonRpcEngine();

      engine.push(createOriginMiddleware(MOCK_SNAP_ID));
      engine.push((request, response, next, end) => {
        const result = implementation(
          request as JsonRpcRequest<ScheduleBackgroundEventParams>,
          response as PendingJsonRpcResponse<ScheduleBackgroundEventResult>,
          next,
          end,
          hooks,
        );

        result?.catch(end);
      });

      const response = await engine.handle({
        jsonrpc: '2.0',
        id: 1,
        method: 'snap_scheduleBackgroundEvent',
        params: {
          date: '2022-01-01T01:00Z',
          request: {
            method: 'handleExport',
            params: ['p1'],
          },
        },
      });

      expect(response).toStrictEqual({ jsonrpc: '2.0', id: 1, result: 'foo' });
    });

    it('schedules a background event with minute precision', async () => {
      const { implementation } = scheduleBackgroundEventHandler;

      const scheduleBackgroundEvent = jest.fn();
      const hasPermission = jest.fn().mockImplementation(() => true);

      const hooks = {
        scheduleBackgroundEvent,
        hasPermission,
      };

      const engine = new JsonRpcEngine();

      engine.push(createOriginMiddleware(MOCK_SNAP_ID));
      engine.push((request, response, next, end) => {
        const result = implementation(
          request as JsonRpcRequest<ScheduleBackgroundEventParams>,
          response as PendingJsonRpcResponse<ScheduleBackgroundEventResult>,
          next,
          end,
          hooks,
        );

        result?.catch(end);
      });

      await engine.handle({
        jsonrpc: '2.0',
        id: 1,
        method: 'snap_scheduleBackgroundEvent',
        params: {
          date: '2022-01-01T01:00:35+02:00',
          request: {
            method: 'handleExport',
            params: ['p1'],
          },
        },
      });

      expect(scheduleBackgroundEvent).toHaveBeenCalledWith({
        date: '2021-12-31T18:00-05:00',
        request: {
          method: 'handleExport',
          params: ['p1'],
        },
      });
    });

    it('throws if a snap does not have the "endowment:cronjob" permission', async () => {
      const { implementation } = scheduleBackgroundEventHandler;

      const scheduleBackgroundEvent = jest.fn();
      const hasPermission = jest.fn().mockImplementation(() => false);

      const hooks = {
        scheduleBackgroundEvent,
        hasPermission,
      };

      const engine = new JsonRpcEngine();

      engine.push(createOriginMiddleware(MOCK_SNAP_ID));
      engine.push((request, response, next, end) => {
        const result = implementation(
          request as JsonRpcRequest<ScheduleBackgroundEventParams>,
          response as PendingJsonRpcResponse<ScheduleBackgroundEventResult>,
          next,
          end,
          hooks,
        );

        result?.catch(end);
      });

      const response = await engine.handle({
        jsonrpc: '2.0',
        id: 1,
        method: 'snap_scheduleBackgroundEvent',
        params: {
          date: '2022-01-01T01:00Z',
          request: {
            method: 'handleExport',
            params: ['p1'],
          },
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

    it('throws if no timezone information is provided in the ISO8601 string', async () => {
      const { implementation } = scheduleBackgroundEventHandler;

      const scheduleBackgroundEvent = jest.fn();
      const hasPermission = jest.fn().mockImplementation(() => true);

      const hooks = {
        scheduleBackgroundEvent,
        hasPermission,
      };

      const engine = new JsonRpcEngine();

      engine.push(createOriginMiddleware(MOCK_SNAP_ID));
      engine.push((request, response, next, end) => {
        const result = implementation(
          request as JsonRpcRequest<ScheduleBackgroundEventParams>,
          response as PendingJsonRpcResponse<ScheduleBackgroundEventResult>,
          next,
          end,
          hooks,
        );

        result?.catch(end);
      });

      const response = await engine.handle({
        jsonrpc: '2.0',
        id: 1,
        method: 'snap_scheduleBackgroundEvent',
        params: {
          date: '2022-01-01T01:00',
          request: {
            method: 'handleExport',
            params: ['p1'],
          },
        },
      });

      expect(response).toStrictEqual({
        error: {
          code: -32602,
          message:
            'Invalid params: At path: date -- ISO8601 string must have timezone information.',
          stack: expect.any(String),
        },
        id: 1,
        jsonrpc: '2.0',
      });
    });

    it('throws on invalid params', async () => {
      const { implementation } = scheduleBackgroundEventHandler;

      const scheduleBackgroundEvent = jest.fn();
      const hasPermission = jest.fn().mockImplementation(() => true);

      const hooks = {
        scheduleBackgroundEvent,
        hasPermission,
      };

      const engine = new JsonRpcEngine();

      engine.push(createOriginMiddleware(MOCK_SNAP_ID));
      engine.push((request, response, next, end) => {
        const result = implementation(
          request as JsonRpcRequest<ScheduleBackgroundEventParams>,
          response as PendingJsonRpcResponse<ScheduleBackgroundEventResult>,
          next,
          end,
          hooks,
        );

        result?.catch(end);
      });

      const response = await engine.handle({
        jsonrpc: '2.0',
        id: 1,
        method: 'snap_scheduleBackgroundEvent',
        params: {
          date: 'foobar',
          request: {
            method: 'handleExport',
            params: ['p1'],
          },
        },
      });

      expect(response).toStrictEqual({
        error: {
          code: -32602,
          message:
            'Invalid params: At path: date -- Not a valid ISO8601 string.',
          stack: expect.any(String),
        },
        id: 1,
        jsonrpc: '2.0',
      });
    });
  });
});

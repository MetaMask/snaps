import { JsonRpcEngine } from '@metamask/json-rpc-engine';
import type {
  ScheduleBackgroundEventParams,
  ScheduleBackgroundEventResult,
} from '@metamask/snaps-sdk';
import { MOCK_SNAP_ID } from '@metamask/snaps-utils/test-utils';
import type { JsonRpcRequest, PendingJsonRpcResponse } from '@metamask/utils';

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
    beforeAll(() => {
      jest.useFakeTimers();

      // Specifically setting a Date that is in between two seconds.
      jest.setSystemTime(1747833920500);
    });

    afterAll(() => {
      jest.useRealTimers();
    });

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

    it('schedules a background event', async () => {
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
          date: '2022-01-01T01:00:35.786+02:00',
          request: {
            method: 'handleExport',
            params: ['p1'],
          },
        },
      });

      expect(scheduleBackgroundEvent).toHaveBeenCalledWith({
        schedule: '2022-01-01T01:00:35.786+02:00',
        request: {
          method: 'handleExport',
          params: ['p1'],
        },
      });
    });

    it('schedules a background event using a duration', async () => {
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
          duration: 'PT1S',
          request: {
            method: 'handleExport',
            params: ['p1'],
          },
        },
      });

      expect(scheduleBackgroundEvent).toHaveBeenCalledWith({
        schedule: 'PT1S',
        request: {
          method: 'handleExport',
          params: ['p1'],
        },
      });
    });

    it('throws on an invalid duration', async () => {
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
          duration: 'PQ30S',
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
            'Invalid params: At path: duration -- Not a valid ISO 8601 duration.',
          stack: expect.any(String),
        },
        id: 1,
        jsonrpc: '2.0',
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
          code: 4100,
          message:
            'The requested account and/or method has not been authorized by the user.',
          stack: expect.any(String),
        },
        id: 1,
        jsonrpc: '2.0',
      });
    });

    it('throws if no timezone information is provided in the ISO 8601 date', async () => {
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
            'Invalid params: At path: date -- ISO 8601 date must have timezone information.',
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
            'Invalid params: At path: date -- Not a valid ISO 8601 date.',
          stack: expect.any(String),
        },
        id: 1,
        jsonrpc: '2.0',
      });
    });
  });
});

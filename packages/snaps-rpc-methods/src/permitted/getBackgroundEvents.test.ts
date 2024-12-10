import { JsonRpcEngine } from '@metamask/json-rpc-engine';
import type { GetBackgroundEventsResult } from '@metamask/snaps-sdk';
import { MOCK_SNAP_ID } from '@metamask/snaps-utils/test-utils';
import type { PendingJsonRpcResponse } from '@metamask/utils';

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
    it('returns an array of background events after calling the `getBackgroundEvents` hook', async () => {
      const { implementation } = getBackgroundEventsHandler;

      const backgroundEvents = [
        {
          id: 'foo',
          snapId: MOCK_SNAP_ID,
          date: '2022-01-01T01:00',
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

      const hooks = {
        getBackgroundEvents,
      };

      const engine = new JsonRpcEngine();

      engine.push((request, response, next, end) => {
        const result = implementation(
          request,
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

      const hooks = {
        getBackgroundEvents,
      };

      const engine = new JsonRpcEngine();

      engine.push((request, response, next, end) => {
        const result = implementation(
          request,
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
  });
});

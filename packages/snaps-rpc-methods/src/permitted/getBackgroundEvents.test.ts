import { JsonRpcEngine } from '@metamask/json-rpc-engine';
import type {
  GetBackgroundEventsParams,
  GetBackgroundEventsResult,
  SnapId,
} from '@metamask/snaps-sdk';
import {
  MOCK_SNAP_ID,
  MockControllerMessenger,
  createOriginMiddleware,
} from '@metamask/snaps-utils/test-utils';
import type { JsonRpcRequest, PendingJsonRpcResponse } from '@metamask/utils';

import type { GetBackgroundEventsMethodActions } from './getBackgroundEvents';
import { getBackgroundEventsHandler } from './getBackgroundEvents';

describe('snap_getBackgroundEvents', () => {
  describe('getBackgroundEventsHandler', () => {
    it('has the expected shape', () => {
      expect(getBackgroundEventsHandler).toMatchObject({
        implementation: expect.any(Function),
        actionNames: [
          'PermissionController:hasPermission',
          'CronjobController:get',
        ],
      });
    });
  });

  describe('implementation', () => {
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

    const getMessenger = () => {
      const messenger = new MockControllerMessenger<
        GetBackgroundEventsMethodActions,
        never
      >();

      messenger.registerActionHandler(
        'PermissionController:hasPermission',
        () => true,
      );

      messenger.registerActionHandler(
        'CronjobController:get',
        () => backgroundEvents,
      );

      jest.spyOn(messenger, 'call');

      return messenger;
    };

    it('returns an array of background events after calling the `CronjobController:get` action', async () => {
      const { implementation } = getBackgroundEventsHandler;

      const messenger = getMessenger();

      const engine = new JsonRpcEngine();

      engine.push(createOriginMiddleware(MOCK_SNAP_ID));
      engine.push((request, response, next, end) => {
        const result = implementation(
          request as JsonRpcRequest<GetBackgroundEventsParams> & {
            origin: SnapId;
          },
          response as PendingJsonRpcResponse<GetBackgroundEventsResult>,
          next,
          end,
          {} as never,
          messenger,
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

      const messenger = getMessenger();

      const engine = new JsonRpcEngine();

      engine.push(createOriginMiddleware(MOCK_SNAP_ID));
      engine.push((request, response, next, end) => {
        const result = implementation(
          request as JsonRpcRequest<GetBackgroundEventsParams> & {
            origin: SnapId;
          },
          response as PendingJsonRpcResponse<GetBackgroundEventsResult>,
          next,
          end,
          {} as never,
          messenger,
        );

        result?.catch(end);
      });

      await engine.handle({
        jsonrpc: '2.0',
        id: 1,
        method: 'snap_getBackgroundEvents',
      });

      expect(messenger.call).toHaveBeenCalledWith(
        'CronjobController:get',
        MOCK_SNAP_ID,
      );
    });

    it('will throw if the call to the `CronjobController:get` action fails', async () => {
      const { implementation } = getBackgroundEventsHandler;

      const messenger = getMessenger();

      messenger.registerActionHandler('CronjobController:get', () => {
        throw new Error('foobar');
      });

      const engine = new JsonRpcEngine();

      engine.push(createOriginMiddleware(MOCK_SNAP_ID));
      engine.push((request, response, next, end) => {
        const result = implementation(
          request as JsonRpcRequest<GetBackgroundEventsParams> & {
            origin: SnapId;
          },
          response as PendingJsonRpcResponse<GetBackgroundEventsResult>,
          next,
          end,
          {} as never,
          messenger,
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

      const messenger = getMessenger();

      messenger.registerActionHandler(
        'PermissionController:hasPermission',
        () => false,
      );

      const engine = new JsonRpcEngine();

      engine.push(createOriginMiddleware(MOCK_SNAP_ID));
      engine.push((request, response, next, end) => {
        const result = implementation(
          request as JsonRpcRequest<GetBackgroundEventsParams> & {
            origin: SnapId;
          },
          response as PendingJsonRpcResponse<GetBackgroundEventsResult>,
          next,
          end,
          {} as never,
          messenger,
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
  });
});

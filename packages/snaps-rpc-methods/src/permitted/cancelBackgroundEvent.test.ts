import {
  JsonRpcEngine,
  createOriginMiddleware,
} from '@metamask/json-rpc-engine';
import type {
  CancelBackgroundEventParams,
  CancelBackgroundEventResult,
  SnapId,
} from '@metamask/snaps-sdk';
import {
  MOCK_SNAP_ID,
  MockControllerMessenger,
} from '@metamask/snaps-utils/test-utils';
import type { JsonRpcRequest, PendingJsonRpcResponse } from '@metamask/utils';

import type { CancelBackgroundEventMethodActions } from './cancelBackgroundEvent';
import { cancelBackgroundEventHandler } from './cancelBackgroundEvent';

describe('snap_cancelBackgroundEvent', () => {
  describe('cancelBackgroundEventHandler', () => {
    it('has the expected shape', () => {
      expect(cancelBackgroundEventHandler).toMatchObject({
        implementation: expect.any(Function),
        actionNames: [
          'PermissionController:hasPermission',
          'CronjobController:cancel',
        ],
      });
    });
  });

  describe('implementation', () => {
    const getMessenger = () => {
      const messenger = new MockControllerMessenger<
        CancelBackgroundEventMethodActions,
        never
      >();

      messenger.registerActionHandler(
        'PermissionController:hasPermission',
        () => true,
      );

      messenger.registerActionHandler(
        'CronjobController:cancel',
        () => undefined,
      );

      jest.spyOn(messenger, 'call');

      return messenger;
    };

    it('returns null after calling the `CronjobController:cancel` action', async () => {
      const { implementation } = cancelBackgroundEventHandler;

      const messenger = getMessenger();

      const engine = new JsonRpcEngine();

      engine.push(createOriginMiddleware(MOCK_SNAP_ID));
      engine.push((request, response, next, end) => {
        const result = implementation(
          request as JsonRpcRequest<CancelBackgroundEventParams> & {
            origin: SnapId;
          },
          response as PendingJsonRpcResponse<CancelBackgroundEventResult>,
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
          id: 'foo',
        },
      });

      expect(response).toStrictEqual({ jsonrpc: '2.0', id: 1, result: null });
    });

    it('cancels a background event', async () => {
      const { implementation } = cancelBackgroundEventHandler;

      const messenger = getMessenger();

      const engine = new JsonRpcEngine();

      engine.push(createOriginMiddleware(MOCK_SNAP_ID));
      engine.push((request, response, next, end) => {
        const result = implementation(
          request as JsonRpcRequest<CancelBackgroundEventParams> & {
            origin: SnapId;
          },
          response as PendingJsonRpcResponse<CancelBackgroundEventResult>,
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
        method: 'snap_cancelBackgroundEvent',
        params: {
          id: 'foo',
        },
      });

      expect(messenger.call).toHaveBeenCalledWith(
        'CronjobController:cancel',
        MOCK_SNAP_ID,
        'foo',
      );
    });

    it('throws if a snap does not have the "endowment:cronjob" permission', async () => {
      const { implementation } = cancelBackgroundEventHandler;

      const messenger = getMessenger();

      messenger.registerActionHandler(
        'PermissionController:hasPermission',
        () => false,
      );

      const engine = new JsonRpcEngine();

      engine.push(createOriginMiddleware(MOCK_SNAP_ID));
      engine.push((request, response, next, end) => {
        const result = implementation(
          request as JsonRpcRequest<CancelBackgroundEventParams> & {
            origin: SnapId;
          },
          response as PendingJsonRpcResponse<CancelBackgroundEventResult>,
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

    it('throws on invalid params', async () => {
      const { implementation } = cancelBackgroundEventHandler;

      const messenger = getMessenger();

      const engine = new JsonRpcEngine();

      engine.push(createOriginMiddleware(MOCK_SNAP_ID));
      engine.push((request, response, next, end) => {
        const result = implementation(
          request as JsonRpcRequest<CancelBackgroundEventParams> & {
            origin: SnapId;
          },
          response as PendingJsonRpcResponse<CancelBackgroundEventResult>,
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

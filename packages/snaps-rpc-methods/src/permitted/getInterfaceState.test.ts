import {
  JsonRpcEngine,
  createOriginMiddleware,
} from '@metamask/json-rpc-engine';
import { type GetInterfaceStateResult } from '@metamask/snaps-sdk';
import {
  MOCK_SNAP_ID,
  MockControllerMessenger,
} from '@metamask/snaps-utils/test-utils';
import type { JsonRpcRequest, PendingJsonRpcResponse } from '@metamask/utils';

import type {
  GetInterfaceStateMethodActions,
  GetInterfaceStateParameters,
} from './getInterfaceState';
import { getInterfaceStateHandler } from './getInterfaceState';

describe('snap_getInterfaceState', () => {
  describe('getInterfaceStateHandler', () => {
    it('has the expected shape', () => {
      expect(getInterfaceStateHandler).toMatchObject({
        implementation: expect.any(Function),
        actionNames: [
          'PermissionController:hasPermission',
          'SnapInterfaceController:getInterfaceState',
        ],
      });
    });
  });

  describe('implementation', () => {
    const getMessenger = () => {
      const messenger = new MockControllerMessenger<
        GetInterfaceStateMethodActions,
        never
      >();

      messenger.registerActionHandler(
        'PermissionController:hasPermission',
        () => true,
      );

      messenger.registerActionHandler(
        'SnapInterfaceController:getInterfaceState',
        () => ({ foo: 'bar' }),
      );

      jest.spyOn(messenger, 'call');

      return messenger;
    };

    it('throws if the origin does not have permission to show UI', async () => {
      const { implementation } = getInterfaceStateHandler;

      const messenger = getMessenger();

      messenger.registerActionHandler(
        'PermissionController:hasPermission',
        () => false,
      );

      const engine = new JsonRpcEngine();

      engine.push(createOriginMiddleware(MOCK_SNAP_ID));
      engine.push((request, response, next, end) => {
        const result = implementation(
          request as JsonRpcRequest<GetInterfaceStateParameters> & {
            origin: string;
          },
          response as PendingJsonRpcResponse<GetInterfaceStateResult>,
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
        method: 'snap_getInterfaceState',
        params: {
          id: 'foo',
        },
      });

      expect(response).toStrictEqual({
        error: {
          code: 4100,
          message:
            'This method can only be used if the Snap has one of the following permissions: snap_dialog, snap_notify, endowment:page-home, endowment:page-settings, endowment:transaction-insight, endowment:signature-insight.',
          stack: expect.any(String),
        },
        id: 1,
        jsonrpc: '2.0',
      });
    });

    it('returns the result from the `SnapInterfaceController:getInterfaceState` action', async () => {
      const { implementation } = getInterfaceStateHandler;

      const messenger = getMessenger();

      const engine = new JsonRpcEngine();

      engine.push(createOriginMiddleware(MOCK_SNAP_ID));
      engine.push((request, response, next, end) => {
        const result = implementation(
          request as JsonRpcRequest<GetInterfaceStateParameters> & {
            origin: string;
          },
          response as PendingJsonRpcResponse<GetInterfaceStateResult>,
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
        method: 'snap_getInterfaceState',
        params: {
          id: 'foo',
        },
      });

      expect(response).toStrictEqual({
        jsonrpc: '2.0',
        id: 1,
        result: { foo: 'bar' },
      });
    });

    it('throws on invalid params', async () => {
      const { implementation } = getInterfaceStateHandler;

      const messenger = getMessenger();

      const engine = new JsonRpcEngine();

      engine.push(createOriginMiddleware(MOCK_SNAP_ID));
      engine.push((request, response, next, end) => {
        const result = implementation(
          request as JsonRpcRequest<GetInterfaceStateParameters> & {
            origin: string;
          },
          response as PendingJsonRpcResponse<GetInterfaceStateResult>,
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
        method: 'snap_getInterfaceState',
        params: {
          id: 42,
        },
      });

      expect(response).toStrictEqual({
        error: {
          code: -32602,
          message:
            'Invalid params: At path: id -- Expected a string, but received: 42.',
          stack: expect.any(String),
        },
        id: 1,
        jsonrpc: '2.0',
      });
    });
  });
});

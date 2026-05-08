import { JsonRpcEngine } from '@metamask/json-rpc-engine';
import { errorCodes } from '@metamask/rpc-errors';
import type { ClearStateResult } from '@metamask/snaps-sdk';
import {
  MOCK_SNAP_ID,
  MockControllerMessenger,
  createOriginMiddleware,
} from '@metamask/snaps-utils/test-utils';
import type { PendingJsonRpcResponse } from '@metamask/utils';

import type {
  ClearStateMethodActions,
  ClearStateParameters,
} from './clearState';
import { clearStateHandler } from './clearState';
import type { JsonRpcRequestWithOrigin } from '../types';

describe('snap_clearState', () => {
  describe('clearStateHandler', () => {
    it('has the expected shape', () => {
      expect(clearStateHandler).toMatchObject({
        implementation: expect.any(Function),
        actionNames: [
          'PermissionController:hasPermission',
          'SnapController:clearSnapState',
        ],
      });
    });
  });

  describe('implementation', () => {
    const getMessenger = () => {
      const messenger = new MockControllerMessenger<
        ClearStateMethodActions,
        never
      >();

      messenger.registerActionHandler(
        'PermissionController:hasPermission',
        () => true,
      );

      messenger.registerActionHandler(
        'SnapController:clearSnapState',
        () => undefined,
      );

      jest.spyOn(messenger, 'call');

      return messenger;
    };

    it('returns the result from the `clearSnapState` action', async () => {
      const { implementation } = clearStateHandler;

      const messenger = getMessenger();

      const engine = new JsonRpcEngine();

      engine.push(createOriginMiddleware(MOCK_SNAP_ID));
      engine.push((request, response, next, end) => {
        const result = implementation(
          request as JsonRpcRequestWithOrigin<ClearStateParameters>,
          response as PendingJsonRpcResponse<ClearStateResult>,
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
        method: 'snap_clearState',
        params: {},
      });

      expect(messenger.call).toHaveBeenCalledWith(
        'SnapController:clearSnapState',
        MOCK_SNAP_ID,
        true,
      );
      expect(response).toStrictEqual({
        jsonrpc: '2.0',
        id: 1,
        result: null,
      });
    });

    it('clears unencrypted state if specified', async () => {
      const { implementation } = clearStateHandler;

      const messenger = getMessenger();

      const engine = new JsonRpcEngine();

      engine.push(createOriginMiddleware(MOCK_SNAP_ID));
      engine.push((request, response, next, end) => {
        const result = implementation(
          request as JsonRpcRequestWithOrigin<ClearStateParameters>,
          response as PendingJsonRpcResponse<ClearStateResult>,
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
        method: 'snap_clearState',
        params: {
          encrypted: false,
        },
      });

      expect(messenger.call).toHaveBeenCalledWith(
        'SnapController:clearSnapState',
        MOCK_SNAP_ID,
        false,
      );
      expect(response).toStrictEqual({
        jsonrpc: '2.0',
        id: 1,
        result: null,
      });
    });

    it('throws if the requesting origin does not have the required permission', async () => {
      const { implementation } = clearStateHandler;

      const messenger = getMessenger();

      messenger.registerActionHandler(
        'PermissionController:hasPermission',
        () => false,
      );

      const engine = new JsonRpcEngine();

      engine.push(createOriginMiddleware(MOCK_SNAP_ID));
      engine.push((request, response, next, end) => {
        const result = implementation(
          request as JsonRpcRequestWithOrigin<ClearStateParameters>,
          response as PendingJsonRpcResponse<ClearStateResult>,
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
        method: 'snap_clearState',
        params: {},
      });

      expect(messenger.call).not.toHaveBeenCalledWith(
        'SnapController:clearSnapState',
        expect.anything(),
        expect.anything(),
      );
      expect(response).toStrictEqual({
        jsonrpc: '2.0',
        id: 1,
        error: {
          code: errorCodes.provider.unauthorized,
          message:
            'The requested account and/or method has not been authorized by the user.',
          stack: expect.any(String),
        },
      });
    });

    it('throws if the parameters are invalid', async () => {
      const { implementation } = clearStateHandler;

      const messenger = getMessenger();

      const engine = new JsonRpcEngine();

      engine.push(createOriginMiddleware(MOCK_SNAP_ID));
      engine.push((request, response, next, end) => {
        const result = implementation(
          request as JsonRpcRequestWithOrigin<ClearStateParameters>,
          response as PendingJsonRpcResponse<ClearStateResult>,
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
        method: 'snap_clearState',
        params: {
          encrypted: 'foo',
        },
      });

      expect(response).toStrictEqual({
        jsonrpc: '2.0',
        id: 1,
        error: {
          code: errorCodes.rpc.invalidParams,
          message:
            'Invalid params: At path: encrypted -- Expected a value of type `boolean`, but received: `"foo"`.',
          stack: expect.any(String),
        },
      });
    });
  });
});

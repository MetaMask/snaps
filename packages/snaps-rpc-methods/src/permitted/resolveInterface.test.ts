import { JsonRpcEngine } from '@metamask/json-rpc-engine';
import type {
  ResolveInterfaceParams,
  ResolveInterfaceResult,
} from '@metamask/snaps-sdk';
import {
  MOCK_SNAP_ID,
  MockControllerMessenger,
  createOriginMiddleware,
} from '@metamask/snaps-utils/test-utils';
import type { JsonRpcRequest, PendingJsonRpcResponse } from '@metamask/utils';

import type { ResolveInterfaceMethodActions } from './resolveInterface';
import { resolveInterfaceHandler } from './resolveInterface';

describe('snap_resolveInterface', () => {
  describe('resolveInterfaceHandler', () => {
    it('has the expected shape', () => {
      expect(resolveInterfaceHandler).toMatchObject({
        implementation: expect.any(Function),
        actionNames: [
          'PermissionController:hasPermission',
          'SnapInterfaceController:resolveInterface',
        ],
      });
    });
  });

  describe('implementation', () => {
    const getMessenger = () => {
      const messenger = new MockControllerMessenger<
        ResolveInterfaceMethodActions,
        never
      >();

      messenger.registerActionHandler(
        'PermissionController:hasPermission',
        () => true,
      );

      messenger.registerActionHandler(
        'SnapInterfaceController:resolveInterface',
        async () => undefined,
      );

      jest.spyOn(messenger, 'call');

      return messenger;
    };

    it('throws if the origin does not have permission to show UI', async () => {
      const { implementation } = resolveInterfaceHandler;

      const messenger = getMessenger();

      messenger.registerActionHandler(
        'PermissionController:hasPermission',
        () => false,
      );

      const engine = new JsonRpcEngine();

      engine.push(createOriginMiddleware(MOCK_SNAP_ID));
      engine.push((request, response, next, end) => {
        const result = implementation(
          request as JsonRpcRequest<ResolveInterfaceParams> & {
            origin: string;
          },
          response as PendingJsonRpcResponse<ResolveInterfaceResult>,
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
        method: 'snap_resolveInterface',
        params: {
          id: 'foo',
          value: 'bar',
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

    it('returns null after calling the `SnapInterfaceController:resolveInterface` action', async () => {
      const { implementation } = resolveInterfaceHandler;

      const messenger = getMessenger();

      const engine = new JsonRpcEngine();

      engine.push(createOriginMiddleware(MOCK_SNAP_ID));
      engine.push((request, response, next, end) => {
        const result = implementation(
          request as JsonRpcRequest<ResolveInterfaceParams> & {
            origin: string;
          },
          response as PendingJsonRpcResponse<ResolveInterfaceResult>,
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
        method: 'snap_resolveInterface',
        params: {
          id: 'foo',
          value: 'bar',
        },
      });

      expect(response).toStrictEqual({ jsonrpc: '2.0', id: 1, result: null });
    });

    it('resolves an interface', async () => {
      const { implementation } = resolveInterfaceHandler;

      const messenger = getMessenger();

      const engine = new JsonRpcEngine();

      engine.push(createOriginMiddleware(MOCK_SNAP_ID));
      engine.push((request, response, next, end) => {
        const result = implementation(
          request as JsonRpcRequest<ResolveInterfaceParams> & {
            origin: string;
          },
          response as PendingJsonRpcResponse<ResolveInterfaceResult>,
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
        method: 'snap_resolveInterface',
        params: {
          id: 'foo',
          value: 'bar',
        },
      });

      expect(messenger.call).toHaveBeenCalledWith(
        'SnapInterfaceController:resolveInterface',
        MOCK_SNAP_ID,
        'foo',
        'bar',
      );
    });

    it('throws on invalid params', async () => {
      const { implementation } = resolveInterfaceHandler;

      const messenger = getMessenger();

      const engine = new JsonRpcEngine();

      engine.push(createOriginMiddleware(MOCK_SNAP_ID));
      engine.push((request, response, next, end) => {
        const result = implementation(
          request as JsonRpcRequest<ResolveInterfaceParams> & {
            origin: string;
          },
          response as PendingJsonRpcResponse<ResolveInterfaceResult>,
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
        method: 'snap_resolveInterface',
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

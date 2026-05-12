import {
  JsonRpcEngine,
  createOriginMiddleware,
} from '@metamask/json-rpc-engine';
import type {
  UpdateInterfaceParams,
  UpdateInterfaceResult,
} from '@metamask/snaps-sdk';
import { NodeType } from '@metamask/snaps-sdk';
import { Box, type JSXElement, Text } from '@metamask/snaps-sdk/jsx';
import {
  MOCK_SNAP_ID,
  MockControllerMessenger,
} from '@metamask/snaps-utils/test-utils';
import type { JsonRpcRequest, PendingJsonRpcResponse } from '@metamask/utils';

import type { UpdateInterfaceMethodActions } from './updateInterface';
import { updateInterfaceHandler } from './updateInterface';

describe('snap_updateInterface', () => {
  describe('updateInterfaceHandler', () => {
    it('has the expected shape', () => {
      expect(updateInterfaceHandler).toMatchObject({
        implementation: expect.any(Function),
        actionNames: [
          'PermissionController:hasPermission',
          'SnapInterfaceController:updateInterface',
        ],
      });
    });
  });

  describe('implementation', () => {
    const getMessenger = () => {
      const messenger = new MockControllerMessenger<
        UpdateInterfaceMethodActions,
        never
      >();

      messenger.registerActionHandler(
        'PermissionController:hasPermission',
        () => true,
      );

      messenger.registerActionHandler(
        'SnapInterfaceController:updateInterface',
        () => undefined,
      );

      jest.spyOn(messenger, 'call');

      return messenger;
    };

    it('throws if the origin does not have permission to show UI', async () => {
      const { implementation } = updateInterfaceHandler;

      const messenger = getMessenger();

      messenger.registerActionHandler(
        'PermissionController:hasPermission',
        () => false,
      );

      const engine = new JsonRpcEngine();

      engine.push(createOriginMiddleware(MOCK_SNAP_ID));
      engine.push((request, response, next, end) => {
        const result = implementation(
          request as JsonRpcRequest<UpdateInterfaceParams> & {
            origin: string;
          },
          response as PendingJsonRpcResponse<UpdateInterfaceResult>,
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
        method: 'snap_updateInterface',
        params: {
          id: 'foo',
          ui: (
            <Box>
              <Text>Hello, world!</Text>
            </Box>
          ) as JSXElement,
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

    it('returns null after calling the `SnapInterfaceController:updateInterface` action', async () => {
      const { implementation } = updateInterfaceHandler;

      const messenger = getMessenger();

      const engine = new JsonRpcEngine();

      engine.push(createOriginMiddleware(MOCK_SNAP_ID));
      engine.push((request, response, next, end) => {
        const result = implementation(
          request as JsonRpcRequest<UpdateInterfaceParams> & {
            origin: string;
          },
          response as PendingJsonRpcResponse<UpdateInterfaceResult>,
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
        method: 'snap_updateInterface',
        params: {
          id: 'foo',
          ui: { type: NodeType.Text as const, value: 'foo' },
        },
      });

      expect(response).toStrictEqual({ jsonrpc: '2.0', id: 1, result: null });
    });

    it('updates a JSX interface', async () => {
      const { implementation } = updateInterfaceHandler;

      const messenger = getMessenger();

      const engine = new JsonRpcEngine();

      engine.push(createOriginMiddleware(MOCK_SNAP_ID));
      engine.push((request, response, next, end) => {
        const result = implementation(
          request as JsonRpcRequest<UpdateInterfaceParams> & {
            origin: string;
          },
          response as PendingJsonRpcResponse<UpdateInterfaceResult>,
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
        method: 'snap_updateInterface',
        params: {
          id: 'foo',
          ui: (
            <Box>
              <Text>Hello, world!</Text>
            </Box>
          ) as JSXElement,
        },
      });

      expect(messenger.call).toHaveBeenCalledWith(
        'SnapInterfaceController:updateInterface',
        MOCK_SNAP_ID,
        'foo',
        <Box>
          <Text>Hello, world!</Text>
        </Box>,
        undefined,
      );
    });

    it('updates the interface context', async () => {
      const { implementation } = updateInterfaceHandler;

      const messenger = getMessenger();

      const engine = new JsonRpcEngine();

      engine.push(createOriginMiddleware(MOCK_SNAP_ID));
      engine.push((request, response, next, end) => {
        const result = implementation(
          request as JsonRpcRequest<UpdateInterfaceParams> & {
            origin: string;
          },
          response as PendingJsonRpcResponse<UpdateInterfaceResult>,
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
        method: 'snap_updateInterface',
        params: {
          id: 'foo',
          ui: (
            <Box>
              <Text>Hello, world!</Text>
            </Box>
          ) as JSXElement,
          context: { foo: 'bar' },
        },
      });

      expect(messenger.call).toHaveBeenCalledWith(
        'SnapInterfaceController:updateInterface',
        MOCK_SNAP_ID,
        'foo',
        <Box>
          <Text>Hello, world!</Text>
        </Box>,
        { foo: 'bar' },
      );
    });

    it('throws on invalid params', async () => {
      const { implementation } = updateInterfaceHandler;

      const messenger = getMessenger();

      const engine = new JsonRpcEngine();

      engine.push(createOriginMiddleware(MOCK_SNAP_ID));
      engine.push((request, response, next, end) => {
        const result = implementation(
          request as JsonRpcRequest<UpdateInterfaceParams> & {
            origin: string;
          },
          response as PendingJsonRpcResponse<UpdateInterfaceResult>,
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
        method: 'snap_updateInterface',
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

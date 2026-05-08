import {
  JsonRpcEngine,
  createOriginMiddleware,
} from '@metamask/json-rpc-engine';
import { NodeType, type CreateInterfaceResult } from '@metamask/snaps-sdk';
import type { JSXElement } from '@metamask/snaps-sdk/jsx';
import {
  Text,
  Box,
  Field,
  Input,
  Form,
  Container,
  Footer,
  Copyable,
} from '@metamask/snaps-sdk/jsx';
import {
  MOCK_SNAP_ID,
  MockControllerMessenger,
} from '@metamask/snaps-utils/test-utils';
import type { JsonRpcRequest, PendingJsonRpcResponse } from '@metamask/utils';

import type {
  CreateInterfaceMethodActions,
  CreateInterfaceParameters,
} from './createInterface';
import { createInterfaceHandler } from './createInterface';

describe('snap_createInterface', () => {
  describe('createInterfaceHandler', () => {
    it('has the expected shape', () => {
      expect(createInterfaceHandler).toMatchObject({
        implementation: expect.any(Function),
        actionNames: [
          'PermissionController:hasPermission',
          'SnapInterfaceController:createInterface',
        ],
      });
    });
  });

  describe('implementation', () => {
    const getMessenger = () => {
      const messenger = new MockControllerMessenger<
        CreateInterfaceMethodActions,
        never
      >();

      messenger.registerActionHandler(
        'PermissionController:hasPermission',
        () => true,
      );

      messenger.registerActionHandler(
        'SnapInterfaceController:createInterface',
        () => 'foo',
      );

      jest.spyOn(messenger, 'call');

      return messenger;
    };

    it('throws if the origin does not have permission to show UI', async () => {
      const { implementation } = createInterfaceHandler;

      const messenger = getMessenger();

      messenger.registerActionHandler(
        'PermissionController:hasPermission',
        () => false,
      );

      const engine = new JsonRpcEngine();

      engine.push(createOriginMiddleware(MOCK_SNAP_ID));
      engine.push((request, response, next, end) => {
        const result = implementation(
          request as JsonRpcRequest<CreateInterfaceParameters> & {
            origin: string;
          },
          response as PendingJsonRpcResponse<CreateInterfaceResult>,
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
        method: 'snap_createInterface',
        params: {
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

    it('returns the result from the `SnapInterfaceController:createInterface` action', async () => {
      const { implementation } = createInterfaceHandler;

      const messenger = getMessenger();

      const engine = new JsonRpcEngine();

      engine.push(createOriginMiddleware(MOCK_SNAP_ID));
      engine.push((request, response, next, end) => {
        const result = implementation(
          request as JsonRpcRequest<CreateInterfaceParameters> & {
            origin: string;
          },
          response as PendingJsonRpcResponse<CreateInterfaceResult>,
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
        method: 'snap_createInterface',
        params: {
          ui: { type: NodeType.Text as const, value: 'foo' },
        },
      });

      expect(response).toStrictEqual({ jsonrpc: '2.0', id: 1, result: 'foo' });
    });

    it('creates an interface from a JSX element', async () => {
      const { implementation } = createInterfaceHandler;

      const messenger = getMessenger();

      const engine = new JsonRpcEngine();

      engine.push(createOriginMiddleware(MOCK_SNAP_ID));
      engine.push((request, response, next, end) => {
        const result = implementation(
          request as JsonRpcRequest<CreateInterfaceParameters> & {
            origin: string;
          },
          response as PendingJsonRpcResponse<CreateInterfaceResult>,
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
        method: 'snap_createInterface',
        params: {
          ui: (
            <Box>
              <Text>Hello, world!</Text>
            </Box>
          ) as JSXElement,
        },
      });

      expect(response).toStrictEqual({ jsonrpc: '2.0', id: 1, result: 'foo' });
    });

    it('throws on invalid params', async () => {
      const { implementation } = createInterfaceHandler;

      const messenger = getMessenger();

      const engine = new JsonRpcEngine();

      engine.push(createOriginMiddleware(MOCK_SNAP_ID));
      engine.push((request, response, next, end) => {
        const result = implementation(
          request as JsonRpcRequest<CreateInterfaceParameters> & {
            origin: string;
          },
          response as PendingJsonRpcResponse<CreateInterfaceResult>,
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
        method: 'snap_createInterface',
        params: {
          ui: 'foo',
        },
      });

      expect(response).toStrictEqual({
        error: {
          code: -32602,
          message: expect.stringContaining(
            'Invalid params: At path: ui -- Expected type to be one of:',
          ),
          stack: expect.any(String),
        },
        id: 1,
        jsonrpc: '2.0',
      });
    });

    it('throws on invalid UI', async () => {
      const { implementation } = createInterfaceHandler;

      const messenger = getMessenger();

      const engine = new JsonRpcEngine();

      engine.push(createOriginMiddleware(MOCK_SNAP_ID));
      engine.push((request, response, next, end) => {
        const result = implementation(
          request as JsonRpcRequest<CreateInterfaceParameters> & {
            origin: string;
          },
          response as PendingJsonRpcResponse<CreateInterfaceResult>,
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
        method: 'snap_createInterface',
        params: {
          ui: (
            <Box>
              <Field label="Input">
                <Copyable value="foo" />
              </Field>
            </Box>
          ) as JSXElement,
        },
      });

      expect(response).toStrictEqual({
        error: {
          code: -32602,
          message: expect.stringContaining(
            'Invalid params: At path: ui.props.children.props.children -- Expected type to be one of:',
          ),
          stack: expect.any(String),
        },
        id: 1,
        jsonrpc: '2.0',
      });
    });

    it('throws on invalid nested UI', async () => {
      const { implementation } = createInterfaceHandler;

      const messenger = getMessenger();

      const engine = new JsonRpcEngine();

      engine.push(createOriginMiddleware(MOCK_SNAP_ID));
      engine.push((request, response, next, end) => {
        const result = implementation(
          request as JsonRpcRequest<CreateInterfaceParameters> & {
            origin: string;
          },
          response as PendingJsonRpcResponse<CreateInterfaceResult>,
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
        method: 'snap_createInterface',
        params: {
          ui: (
            <Container>
              <Box>
                <Form name="form">
                  <Field label="Input">
                    <Input name="input" />
                  </Field>
                </Form>
              </Box>
              <Footer>
                <Text>Foo</Text>
              </Footer>
            </Container>
          ) as JSXElement,
        },
      });

      expect(response).toStrictEqual({
        error: {
          code: -32602,
          message:
            'Invalid params: At path: ui.props.children.1.props.children.type -- Expected the literal `"Button"`, but received: "Text".',
          stack: expect.any(String),
        },
        id: 1,
        jsonrpc: '2.0',
      });
    });
  });
});

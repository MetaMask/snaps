import { JsonRpcEngine } from '@metamask/json-rpc-engine';
import { text, type CreateInterfaceResult } from '@metamask/snaps-sdk';
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
import type { JsonRpcRequest, PendingJsonRpcResponse } from '@metamask/utils';

import type { CreateInterfaceParameters } from './createInterface';
import { createInterfaceHandler } from './createInterface';

describe('snap_createInterface', () => {
  describe('createInterfaceHandler', () => {
    it('has the expected shape', () => {
      expect(createInterfaceHandler).toMatchObject({
        methodNames: ['snap_createInterface'],
        implementation: expect.any(Function),
        hookNames: {
          createInterface: true,
        },
      });
    });
  });

  describe('implementation', () => {
    it('returns the result from the `createInterface` hook', async () => {
      const { implementation } = createInterfaceHandler;

      const createInterface = jest.fn().mockReturnValue('foo');

      const hooks = {
        createInterface,
      };

      const engine = new JsonRpcEngine();

      engine.push((request, response, next, end) => {
        const result = implementation(
          request as JsonRpcRequest<CreateInterfaceParameters>,
          response as PendingJsonRpcResponse<CreateInterfaceResult>,
          next,
          end,
          hooks,
        );

        result?.catch(end);
      });

      const response = await engine.handle({
        jsonrpc: '2.0',
        id: 1,
        method: 'snap_createInterface',
        params: {
          ui: text('foo'),
        },
      });

      expect(response).toStrictEqual({ jsonrpc: '2.0', id: 1, result: 'foo' });
    });

    it('creates an interface from a JSX element', async () => {
      const { implementation } = createInterfaceHandler;

      const createInterface = jest.fn().mockReturnValue('foo');

      const hooks = {
        createInterface,
      };

      const engine = new JsonRpcEngine();

      engine.push((request, response, next, end) => {
        const result = implementation(
          request as JsonRpcRequest<CreateInterfaceParameters>,
          response as PendingJsonRpcResponse<CreateInterfaceResult>,
          next,
          end,
          hooks,
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
  });

  it('throws on invalid params', async () => {
    const { implementation } = createInterfaceHandler;

    const createInterface = jest.fn().mockReturnValue('foo');

    const hooks = {
      createInterface,
    };

    const engine = new JsonRpcEngine();

    engine.push((request, response, next, end) => {
      const result = implementation(
        request as JsonRpcRequest<CreateInterfaceParameters>,
        response as PendingJsonRpcResponse<CreateInterfaceResult>,
        next,
        end,
        hooks,
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
        message:
          'Invalid params: At path: ui -- Expected type to be one of: "Address", "AssetSelector", "Bold", "Box", "Button", "Copyable", "Divider", "Dropdown", "RadioGroup", "Field", "FileInput", "Form", "Heading", "Input", "Image", "Italic", "Link", "Row", "Spinner", "Text", "Tooltip", "Checkbox", "Card", "Icon", "Selector", "Section", "Avatar", "Banner", "Skeleton", "Container", but received: undefined.',
        stack: expect.any(String),
      },
      id: 1,
      jsonrpc: '2.0',
    });
  });

  it('throws on invalid UI', async () => {
    const { implementation } = createInterfaceHandler;

    const createInterface = jest.fn().mockReturnValue('foo');

    const hooks = {
      createInterface,
    };

    const engine = new JsonRpcEngine();

    engine.push((request, response, next, end) => {
      const result = implementation(
        request as JsonRpcRequest<CreateInterfaceParameters>,
        response as PendingJsonRpcResponse<CreateInterfaceResult>,
        next,
        end,
        hooks,
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
        message:
          'Invalid params: At path: ui.props.children.props.children -- Expected type to be one of: "AssetSelector", "Input", "Dropdown", "RadioGroup", "FileInput", "Checkbox", "Selector", but received: "Copyable".',
        stack: expect.any(String),
      },
      id: 1,
      jsonrpc: '2.0',
    });
  });

  it('throws on invalid nested UI', async () => {
    const { implementation } = createInterfaceHandler;

    const createInterface = jest.fn().mockReturnValue('foo');

    const hooks = {
      createInterface,
    };

    const engine = new JsonRpcEngine();

    engine.push((request, response, next, end) => {
      const result = implementation(
        request as JsonRpcRequest<CreateInterfaceParameters>,
        response as PendingJsonRpcResponse<CreateInterfaceResult>,
        next,
        end,
        hooks,
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

import { JsonRpcEngine } from '@metamask/json-rpc-engine';
import { text, type CreateInterfaceResult } from '@metamask/snaps-sdk';
import type { JSXElement } from '@metamask/snaps-sdk/jsx';
import { Text, Box } from '@metamask/snaps-sdk/jsx';
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
          'Invalid params: At path: ui -- Expected the value to satisfy a union of `union | union`, but received: "foo".',
        stack: expect.any(String),
      },
      id: 1,
      jsonrpc: '2.0',
    });
  });
});

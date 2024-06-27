import { JsonRpcEngine } from '@metamask/json-rpc-engine';
import type {
  ResolveInterfaceParams,
  ResolveInterfaceResult,
} from '@metamask/snaps-sdk';
import type { JsonRpcRequest, PendingJsonRpcResponse } from '@metamask/utils';

import { resolveInterfaceHandler } from './resolveInterface';

describe('snap_resolveInterface', () => {
  describe('resolveInterfaceHandler', () => {
    it('has the expected shape', () => {
      expect(resolveInterfaceHandler).toMatchObject({
        methodNames: ['snap_resolveInterface'],
        implementation: expect.any(Function),
        hookNames: {
          resolveInterface: true,
        },
      });
    });
  });

  describe('implementation', () => {
    it('returns null after calling the `resolveInterface` hook', async () => {
      const { implementation } = resolveInterfaceHandler;

      const resolveInterface = jest.fn();

      const hooks = {
        resolveInterface,
      };

      const engine = new JsonRpcEngine();

      engine.push((request, response, next, end) => {
        const result = implementation(
          request as JsonRpcRequest<ResolveInterfaceParams>,
          response as PendingJsonRpcResponse<ResolveInterfaceResult>,
          next,
          end,
          hooks,
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

      const resolveInterface = jest.fn();

      const hooks = {
        resolveInterface,
      };

      const engine = new JsonRpcEngine();

      engine.push((request, response, next, end) => {
        const result = implementation(
          request as JsonRpcRequest<ResolveInterfaceParams>,
          response as PendingJsonRpcResponse<ResolveInterfaceResult>,
          next,
          end,
          hooks,
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

      expect(resolveInterface).toHaveBeenCalledWith('foo', 'bar');
    });
  });

  it('throws on invalid params', async () => {
    const { implementation } = resolveInterfaceHandler;

    const resolveInterface = jest.fn();

    const hooks = {
      resolveInterface,
    };

    const engine = new JsonRpcEngine();

    engine.push((request, response, next, end) => {
      const result = implementation(
        request as JsonRpcRequest<ResolveInterfaceParams>,
        response as PendingJsonRpcResponse<ResolveInterfaceResult>,
        next,
        end,
        hooks,
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

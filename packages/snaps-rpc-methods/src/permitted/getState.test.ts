import { JsonRpcEngine } from '@metamask/json-rpc-engine';
import { errorCodes } from '@metamask/rpc-errors';
import type { JsonRpcRequest } from '@metamask/utils';

import type { GetStateParameters } from './getState';
import { get, getStateHandler } from './getState';

describe('snap_getState', () => {
  describe('getStateHandler', () => {
    it('has the expected shape', () => {
      expect(getStateHandler).toMatchObject({
        methodNames: ['snap_getState'],
        implementation: expect.any(Function),
        hookNames: {
          getSnapState: true,
          hasPermission: true,
        },
      });
    });
  });

  describe('implementation', () => {
    it('returns the encrypted state', async () => {
      const { implementation } = getStateHandler;

      const getSnapState = jest.fn().mockReturnValue({
        foo: 'bar',
      });

      const getUnlockPromise = jest.fn().mockResolvedValue(undefined);
      const hasPermission = jest.fn().mockReturnValue(true);

      const hooks = {
        getSnapState,
        getUnlockPromise,
        hasPermission,
      };

      const engine = new JsonRpcEngine();

      engine.push((request, response, next, end) => {
        const result = implementation(
          request as JsonRpcRequest<GetStateParameters>,
          response,
          next,
          end,
          hooks,
        );

        result?.catch(end);
      });

      const response = await engine.handle({
        jsonrpc: '2.0',
        id: 1,
        method: 'snap_getState',
        params: {
          key: 'foo',
        },
      });

      expect(getSnapState).toHaveBeenCalledWith(true);
      expect(response).toStrictEqual({
        jsonrpc: '2.0',
        id: 1,
        result: 'bar',
      });
    });

    it('returns the entire state if no key is specified', async () => {
      const { implementation } = getStateHandler;

      const getSnapState = jest.fn().mockReturnValue({
        foo: 'bar',
      });

      const getUnlockPromise = jest.fn().mockResolvedValue(undefined);
      const hasPermission = jest.fn().mockReturnValue(true);

      const hooks = {
        getSnapState,
        getUnlockPromise,
        hasPermission,
      };

      const engine = new JsonRpcEngine();

      engine.push((request, response, next, end) => {
        const result = implementation(
          request as JsonRpcRequest<GetStateParameters>,
          response,
          next,
          end,
          hooks,
        );

        result?.catch(end);
      });

      const response = await engine.handle({
        jsonrpc: '2.0',
        id: 1,
        method: 'snap_getState',
        params: {},
      });

      expect(getSnapState).toHaveBeenCalledWith(true);
      expect(response).toStrictEqual({
        jsonrpc: '2.0',
        id: 1,
        result: {
          foo: 'bar',
        },
      });
    });

    it('returns the unencrypted state', async () => {
      const { implementation } = getStateHandler;

      const getSnapState = jest.fn().mockReturnValue({
        foo: 'bar',
      });

      const getUnlockPromise = jest.fn().mockResolvedValue(undefined);
      const hasPermission = jest.fn().mockReturnValue(true);

      const hooks = {
        getSnapState,
        getUnlockPromise,
        hasPermission,
      };

      const engine = new JsonRpcEngine();

      engine.push((request, response, next, end) => {
        const result = implementation(
          request as JsonRpcRequest<GetStateParameters>,
          response,
          next,
          end,
          hooks,
        );

        result?.catch(end);
      });

      const response = await engine.handle({
        jsonrpc: '2.0',
        id: 1,
        method: 'snap_getState',
        params: {
          key: 'foo',
          encrypted: false,
        },
      });

      expect(getSnapState).toHaveBeenCalledWith(false);
      expect(response).toStrictEqual({
        jsonrpc: '2.0',
        id: 1,
        result: 'bar',
      });
    });

    it('throws if the requesting origin does not have the required permission', async () => {
      const { implementation } = getStateHandler;

      const getSnapState = jest.fn().mockReturnValue({
        foo: 'bar',
      });

      const getUnlockPromise = jest.fn().mockResolvedValue(undefined);
      const hasPermission = jest.fn().mockReturnValue(false);

      const hooks = {
        getSnapState,
        getUnlockPromise,
        hasPermission,
      };

      const engine = new JsonRpcEngine();

      engine.push((request, response, next, end) => {
        const result = implementation(
          request as JsonRpcRequest<GetStateParameters>,
          response,
          next,
          end,
          hooks,
        );

        result?.catch(end);
      });

      const response = await engine.handle({
        jsonrpc: '2.0',
        id: 1,
        method: 'snap_getState',
        params: {},
      });

      expect(getSnapState).not.toHaveBeenCalled();
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
      const { implementation } = getStateHandler;

      const getSnapState = jest.fn().mockReturnValue({
        foo: 'bar',
      });

      const getUnlockPromise = jest.fn().mockResolvedValue(undefined);
      const hasPermission = jest.fn().mockReturnValue(true);

      const hooks = {
        getSnapState,
        getUnlockPromise,
        hasPermission,
      };

      const engine = new JsonRpcEngine();

      engine.push((request, response, next, end) => {
        const result = implementation(
          request as JsonRpcRequest<GetStateParameters>,
          response,
          next,
          end,
          hooks,
        );

        result?.catch(end);
      });

      const response = await engine.handle({
        jsonrpc: '2.0',
        id: 1,
        method: 'snap_getState',
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

describe('get', () => {
  const object = {
    a: {
      b: {
        c: 'value',
      },
    },
  };

  it('returns the value of the key', () => {
    expect(get(object, 'a.b.c')).toBe('value');
  });

  it('returns `null` if the object is `null`', () => {
    expect(get(null, '')).toBeNull();
  });

  it('returns `null` if the key does not exist', () => {
    expect(get(object, 'a.b.d')).toBeNull();
  });

  it('returns `null` if the parent key is not an object', () => {
    expect(get(object, 'a.b.c.d')).toBeNull();
  });

  it('throws an error if the key is a prototype pollution attempt', () => {
    expect(() => get(object, '__proto__.polluted')).toThrow(
      'Invalid params: Key contains forbidden characters.',
    );
  });

  it('throws an error if the key is a constructor pollution attempt', () => {
    expect(() => get(object, 'constructor.polluted')).toThrow(
      'Invalid params: Key contains forbidden characters.',
    );
  });
});

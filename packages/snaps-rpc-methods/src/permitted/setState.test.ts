import { JsonRpcEngine } from '@metamask/json-rpc-engine';
import { errorCodes } from '@metamask/rpc-errors';
import type { SetStateResult } from '@metamask/snaps-sdk';
import {
  createDeferredPromise,
  type Json,
  type JsonRpcRequest,
  type PendingJsonRpcResponse,
} from '@metamask/utils';

import { setStateHandler, type SetStateParameters, set } from './setState';

describe('snap_setState', () => {
  describe('setStateHandler', () => {
    it('has the expected shape', () => {
      expect(setStateHandler).toMatchObject({
        methodNames: ['snap_setState'],
        implementation: expect.any(Function),
        hookNames: {
          getSnapState: true,
          hasPermission: true,
        },
      });
    });
  });

  describe('implementation', () => {
    it('sets the encrypted state', async () => {
      const { implementation } = setStateHandler;

      const getSnapState = jest.fn().mockReturnValue({
        foo: 'bar',
      });

      const updateSnapState = jest.fn().mockReturnValue(null);
      const getUnlockPromise = jest.fn().mockResolvedValue(undefined);
      const hasPermission = jest.fn().mockReturnValue(true);
      const getSnap = jest.fn().mockReturnValue({ preinstalled: false });

      const hooks = {
        getSnapState,
        updateSnapState,
        getUnlockPromise,
        hasPermission,
        getSnap,
      };

      const engine = new JsonRpcEngine();

      engine.push((request, response, next, end) => {
        const result = implementation(
          request as JsonRpcRequest<SetStateParameters>,
          response as PendingJsonRpcResponse<SetStateResult>,
          next,
          end,
          hooks,
        );

        result?.catch(end);
      });

      const response = await engine.handle({
        jsonrpc: '2.0',
        id: 1,
        method: 'snap_setState',
        params: {
          key: 'foo',
          value: 'baz',
        },
      });

      expect(getUnlockPromise).toHaveBeenCalled();
      expect(getSnapState).toHaveBeenCalledWith(true);
      expect(updateSnapState).toHaveBeenCalledWith({ foo: 'baz' }, true);

      expect(response).toStrictEqual({
        jsonrpc: '2.0',
        id: 1,
        result: null,
      });
    });

    it('sets the entire state if no key is specified', async () => {
      const { implementation } = setStateHandler;

      const getSnapState = jest.fn().mockReturnValue({
        foo: 'bar',
      });

      const updateSnapState = jest.fn().mockReturnValue(null);
      const getUnlockPromise = jest.fn().mockResolvedValue(undefined);
      const hasPermission = jest.fn().mockReturnValue(true);
      const getSnap = jest.fn().mockReturnValue({ preinstalled: false });

      const hooks = {
        getSnapState,
        updateSnapState,
        getUnlockPromise,
        hasPermission,
        getSnap,
      };

      const engine = new JsonRpcEngine();

      engine.push((request, response, next, end) => {
        const result = implementation(
          request as JsonRpcRequest<SetStateParameters>,
          response as PendingJsonRpcResponse<SetStateResult>,
          next,
          end,
          hooks,
        );

        result?.catch(end);
      });

      const response = await engine.handle({
        jsonrpc: '2.0',
        id: 1,
        method: 'snap_setState',
        params: {
          value: {
            foo: 'baz',
          },
        },
      });

      expect(getUnlockPromise).toHaveBeenCalled();
      expect(getSnapState).not.toHaveBeenCalled();
      expect(updateSnapState).toHaveBeenCalledWith({ foo: 'baz' }, true);

      expect(response).toStrictEqual({
        jsonrpc: '2.0',
        id: 1,
        result: null,
      });
    });

    it('sets the unencrypted state', async () => {
      const { implementation } = setStateHandler;

      const getSnapState = jest.fn().mockReturnValue({
        foo: 'bar',
      });

      const updateSnapState = jest.fn().mockReturnValue(null);
      const getUnlockPromise = jest.fn().mockResolvedValue(undefined);
      const hasPermission = jest.fn().mockReturnValue(true);
      const getSnap = jest.fn().mockReturnValue({ preinstalled: false });

      const hooks = {
        getSnapState,
        updateSnapState,
        getUnlockPromise,
        hasPermission,
        getSnap,
      };

      const engine = new JsonRpcEngine();

      engine.push((request, response, next, end) => {
        const result = implementation(
          request as JsonRpcRequest<SetStateParameters>,
          response as PendingJsonRpcResponse<SetStateResult>,
          next,
          end,
          hooks,
        );

        result?.catch(end);
      });

      const response = await engine.handle({
        jsonrpc: '2.0',
        id: 1,
        method: 'snap_setState',
        params: {
          key: 'foo',
          value: 'baz',
          encrypted: false,
        },
      });

      expect(getUnlockPromise).not.toHaveBeenCalled();
      expect(getSnapState).toHaveBeenCalledWith(false);
      expect(updateSnapState).toHaveBeenCalledWith(
        {
          foo: 'baz',
        },
        false,
      );

      expect(response).toStrictEqual({
        jsonrpc: '2.0',
        id: 1,
        result: null,
      });
    });

    it('uses a mutex to protect state updates', async () => {
      const { implementation } = setStateHandler;

      const { promise: getStateCalled, resolve: resolveGetStateCalled } =
        createDeferredPromise();
      const getSnapState = jest.fn().mockImplementation(() => {
        resolveGetStateCalled();
        return {};
      });

      const { promise: updateSnapStatePromise, resolve } =
        createDeferredPromise();

      const updateSnapState = jest.fn().mockReturnValue(updateSnapStatePromise);
      const getUnlockPromise = jest.fn().mockResolvedValue(undefined);
      const hasPermission = jest.fn().mockReturnValue(true);
      const getSnap = jest.fn().mockReturnValue({ preinstalled: false });

      const hooks = {
        getSnapState,
        updateSnapState,
        getUnlockPromise,
        hasPermission,
        getSnap,
      };

      const engine = new JsonRpcEngine();

      engine.push((request, response, next, end) => {
        const result = implementation(
          request as JsonRpcRequest<SetStateParameters>,
          response as PendingJsonRpcResponse<SetStateResult>,
          next,
          end,
          hooks,
        );

        result?.catch(end);
      });

      const responsePromise1 = engine.handle({
        jsonrpc: '2.0',
        id: 1,
        method: 'snap_setState',
        params: {
          key: 'foo',
          value: 'baz',
          encrypted: false,
        },
      });

      const responsePromise2 = engine.handle({
        jsonrpc: '2.0',
        id: 2,
        method: 'snap_setState',
        params: {
          key: 'foo',
          value: 'bar',
          encrypted: false,
        },
      });

      await getStateCalled;

      expect(getSnapState).toHaveBeenCalledTimes(1);

      resolve();

      const response1 = await responsePromise1;
      const response2 = await responsePromise2;

      expect(getSnapState).toHaveBeenCalledTimes(2);
      expect(updateSnapState).toHaveBeenNthCalledWith(2, { foo: 'bar' }, false);

      expect(response1).toStrictEqual({
        jsonrpc: '2.0',
        id: 1,
        result: null,
      });

      expect(response2).toStrictEqual({
        jsonrpc: '2.0',
        id: 2,
        result: null,
      });
    });

    it('throws if the requesting origin does not have the required permission', async () => {
      const { implementation } = setStateHandler;

      const getSnapState = jest.fn().mockReturnValue({
        foo: 'bar',
      });

      const updateSnapState = jest.fn().mockReturnValue(null);
      const getUnlockPromise = jest.fn().mockResolvedValue(undefined);
      const hasPermission = jest.fn().mockReturnValue(false);
      const getSnap = jest.fn().mockReturnValue({ preinstalled: false });

      const hooks = {
        getSnapState,
        updateSnapState,
        getUnlockPromise,
        hasPermission,
        getSnap,
      };

      const engine = new JsonRpcEngine();

      engine.push((request, response, next, end) => {
        const result = implementation(
          request as JsonRpcRequest<SetStateParameters>,
          response as PendingJsonRpcResponse<SetStateResult>,
          next,
          end,
          hooks,
        );

        result?.catch(end);
      });

      const response = await engine.handle({
        jsonrpc: '2.0',
        id: 1,
        method: 'snap_setState',
        params: {},
      });

      expect(updateSnapState).not.toHaveBeenCalled();
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
      const { implementation } = setStateHandler;

      const getSnapState = jest.fn().mockReturnValue({
        foo: 'bar',
      });

      const updateSnapState = jest.fn().mockReturnValue(null);
      const getUnlockPromise = jest.fn().mockResolvedValue(undefined);
      const hasPermission = jest.fn().mockReturnValue(true);
      const getSnap = jest.fn().mockReturnValue({ preinstalled: false });

      const hooks = {
        getSnapState,
        updateSnapState,
        getUnlockPromise,
        hasPermission,
        getSnap,
      };

      const engine = new JsonRpcEngine();

      engine.push((request, response, next, end) => {
        const result = implementation(
          request as JsonRpcRequest<SetStateParameters>,
          response as PendingJsonRpcResponse<SetStateResult>,
          next,
          end,
          hooks,
        );

        result?.catch(end);
      });

      const response = await engine.handle({
        jsonrpc: '2.0',
        id: 1,
        method: 'snap_setState',
        params: {},
      });

      expect(response).toStrictEqual({
        jsonrpc: '2.0',
        id: 1,
        error: {
          code: errorCodes.rpc.invalidParams,
          message:
            'Invalid params: At path: value -- Expected a value of type `JSON`, but received: `undefined`.',
          stack: expect.any(String),
        },
      });
    });

    it('throws if the encrypted parameter is invalid', async () => {
      const { implementation } = setStateHandler;

      const getSnapState = jest.fn().mockReturnValue({
        foo: 'bar',
      });

      const updateSnapState = jest.fn().mockReturnValue(null);
      const getUnlockPromise = jest.fn().mockResolvedValue(undefined);
      const hasPermission = jest.fn().mockReturnValue(true);
      const getSnap = jest.fn().mockReturnValue({ preinstalled: false });

      const hooks = {
        getSnapState,
        updateSnapState,
        getUnlockPromise,
        hasPermission,
        getSnap,
      };

      const engine = new JsonRpcEngine();

      engine.push((request, response, next, end) => {
        const result = implementation(
          request as JsonRpcRequest<SetStateParameters>,
          response as PendingJsonRpcResponse<SetStateResult>,
          next,
          end,
          hooks,
        );

        result?.catch(end);
      });

      const response = await engine.handle({
        jsonrpc: '2.0',
        id: 1,
        method: 'snap_setState',
        params: {
          key: 'foo',
          value: 'bar',
          encrypted: 'baz',
        },
      });

      expect(response).toStrictEqual({
        jsonrpc: '2.0',
        id: 1,
        error: {
          code: errorCodes.rpc.invalidParams,
          message:
            'Invalid params: At path: encrypted -- Expected a value of type `boolean`, but received: `"baz"`.',
          stack: expect.any(String),
        },
      });
    });

    it('throws if `key` is not provided and `value` is not an object', async () => {
      const { implementation } = setStateHandler;

      const getSnapState = jest.fn().mockReturnValue({
        foo: 'bar',
      });

      const updateSnapState = jest.fn().mockReturnValue(null);
      const getUnlockPromise = jest.fn().mockResolvedValue(undefined);
      const hasPermission = jest.fn().mockReturnValue(true);
      const getSnap = jest.fn().mockReturnValue({ preinstalled: false });

      const hooks = {
        getSnapState,
        updateSnapState,
        getUnlockPromise,
        hasPermission,
        getSnap,
      };

      const engine = new JsonRpcEngine();

      engine.push((request, response, next, end) => {
        const result = implementation(
          request as JsonRpcRequest<SetStateParameters>,
          response as PendingJsonRpcResponse<SetStateResult>,
          next,
          end,
          hooks,
        );

        result?.catch(end);
      });

      const response = await engine.handle({
        jsonrpc: '2.0',
        id: 1,
        method: 'snap_setState',
        params: {
          value: 'foo',
        },
      });

      expect(response).toStrictEqual({
        jsonrpc: '2.0',
        id: 1,
        error: {
          code: errorCodes.rpc.invalidParams,
          message:
            'Invalid params: Value must be an object if key is not provided.',
          stack: expect.any(String),
        },
      });
    });

    it('throws if the new state is not JSON serialisable', async () => {
      const { implementation } = setStateHandler;

      const getSnapState = jest.fn().mockReturnValue(null);
      const updateSnapState = jest.fn().mockReturnValue(null);
      const getUnlockPromise = jest.fn().mockResolvedValue(undefined);
      const hasPermission = jest.fn().mockReturnValue(true);
      const getSnap = jest.fn().mockReturnValue({ preinstalled: false });

      const hooks = {
        getSnapState,
        updateSnapState,
        getUnlockPromise,
        hasPermission,
        getSnap,
      };

      const engine = new JsonRpcEngine();

      engine.push((request, response, next, end) => {
        const result = implementation(
          request as JsonRpcRequest<SetStateParameters>,
          response as PendingJsonRpcResponse<SetStateResult>,
          next,
          end,
          hooks,
        );

        result?.catch(end);
      });

      const response = await engine.handle({
        jsonrpc: '2.0',
        id: 1,
        method: 'snap_setState',
        params: {
          value: {
            // @ts-expect-error - BigInt is not JSON serializable.
            foo: 1n as Json,
          },
        },
      });

      expect(response).toStrictEqual({
        jsonrpc: '2.0',
        id: 1,
        error: {
          code: errorCodes.rpc.invalidParams,
          message:
            'Invalid params: At path: value -- Expected a value of type `JSON`, but received: `[object Object]`.',
          stack: expect.any(String),
        },
      });
    });

    it('throws if the new state exceeds the size limit', async () => {
      const { implementation } = setStateHandler;

      const getSnapState = jest.fn().mockReturnValue(null);
      const updateSnapState = jest.fn().mockReturnValue(null);
      const getUnlockPromise = jest.fn().mockResolvedValue(undefined);
      const hasPermission = jest.fn().mockReturnValue(true);
      const getSnap = jest.fn().mockReturnValue({ preinstalled: false });

      const hooks = {
        getSnapState,
        updateSnapState,
        getUnlockPromise,
        hasPermission,
        getSnap,
      };

      const engine = new JsonRpcEngine();

      engine.push((request, response, next, end) => {
        const result = implementation(
          request as JsonRpcRequest<SetStateParameters>,
          response as PendingJsonRpcResponse<SetStateResult>,
          next,
          end,
          hooks,
        );

        result?.catch(end);
      });

      const response = await engine.handle({
        jsonrpc: '2.0',
        id: 1,
        method: 'snap_setState',
        params: {
          value: {
            foo: 'foo'.repeat(21_500_000), // 64.5 MB
          },
        },
      });

      expect(response).toStrictEqual({
        jsonrpc: '2.0',
        id: 1,
        error: {
          code: errorCodes.rpc.invalidParams,
          message:
            'Invalid params: The new state must not exceed 64 MB in size.',
          stack: expect.any(String),
        },
      });
    });
  });
});

describe('set', () => {
  it('sets the state in an empty object', () => {
    const object = {};

    expect(set(object, 'key', 'value')).toStrictEqual({
      key: 'value',
    });
  });

  it('sets the state if the current state is `null`', () => {
    const object = null;

    expect(set(object, 'key', 'value')).toStrictEqual({
      key: 'value',
    });
  });

  it('sets the state in an empty object with a nested key', () => {
    const object = {};

    expect(set(object, 'nested.key', 'newValue')).toStrictEqual({
      nested: {
        key: 'newValue',
      },
    });
  });

  it('sets the state in an existing object', () => {
    const object = {
      key: 'oldValue',
    };

    expect(set(object, 'key', 'newValue')).toStrictEqual({
      key: 'newValue',
    });
  });

  it('sets the state in an existing object with a nested key', () => {
    const object = {
      nested: {
        key: 'oldValue',
      },
    };

    expect(set(object, 'nested.key', 'newValue')).toStrictEqual({
      nested: {
        key: 'newValue',
      },
    });
  });

  it('sets the state in an existing object with a nested key that does not exist', () => {
    const object = {
      nested: {},
    };

    expect(set(object, 'nested.key', 'newValue')).toStrictEqual({
      nested: {
        key: 'newValue',
      },
    });
  });

  it('overwrites the nested state in an existing object', () => {
    const object = {
      nested: {
        key: 'oldValue',
      },
    };

    expect(set(object, 'nested', { foo: 'bar' })).toStrictEqual({
      nested: {
        foo: 'bar',
      },
    });
  });

  it('allows overwriting if a parent key is `null`', () => {
    const object = {
      nested: null,
    };

    expect(set(object, 'nested.key', 'newValue')).toStrictEqual({
      nested: {
        key: 'newValue',
      },
    });
  });

  it('throws if a parent key is not an object', () => {
    const object = {
      nested: 'value',
    };

    expect(() => set(object, 'nested.key', 'newValue')).toThrow(
      'Invalid params: Cannot overwrite non-object value.',
    );
  });

  it('throws an error if the key is a prototype pollution attempt', () => {
    expect(() => set({}, '__proto__.polluted', 'value')).toThrow(
      'Invalid params: Key contains forbidden characters.',
    );
  });

  it('throws an error if the key is a constructor pollution attempt', () => {
    expect(() => set({}, 'constructor.polluted', 'value')).toThrow(
      'Invalid params: Key contains forbidden characters.',
    );
  });
});

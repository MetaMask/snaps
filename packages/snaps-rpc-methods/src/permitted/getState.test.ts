import {
  JsonRpcEngine,
  createOriginMiddleware,
} from '@metamask/json-rpc-engine';
import { errorCodes } from '@metamask/rpc-errors';
import {
  MOCK_SNAP_ID,
  MockControllerMessenger,
} from '@metamask/snaps-utils/test-utils';

import type { GetStateMethodActions, GetStateParameters } from './getState';
import { get, getStateHandler } from './getState';
import type { JsonRpcRequestWithOrigin } from '../types';

describe('snap_getState', () => {
  describe('getStateHandler', () => {
    it('has the expected shape', () => {
      expect(getStateHandler).toMatchObject({
        implementation: expect.any(Function),
        hookNames: {
          getUnlockPromise: true,
        },
        actionNames: [
          'PermissionController:hasPermission',
          'SnapController:getSnapState',
        ],
      });
    });
  });

  describe('implementation', () => {
    const getMessenger = () => {
      const messenger = new MockControllerMessenger<
        GetStateMethodActions,
        never
      >();

      messenger.registerActionHandler(
        'PermissionController:hasPermission',
        () => true,
      );

      messenger.registerActionHandler(
        'SnapController:getSnapState',
        async () => ({ foo: 'bar' }),
      );

      jest.spyOn(messenger, 'call');

      return messenger;
    };

    it('returns the encrypted state', async () => {
      const { implementation } = getStateHandler;

      const getUnlockPromise = jest.fn().mockResolvedValue(undefined);
      const hooks = { getUnlockPromise };

      const messenger = getMessenger();

      const engine = new JsonRpcEngine();

      engine.push(createOriginMiddleware(MOCK_SNAP_ID));
      engine.push((request, response, next, end) => {
        const result = implementation(
          request as JsonRpcRequestWithOrigin<GetStateParameters>,
          response,
          next,
          end,
          hooks,
          messenger,
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

      expect(messenger.call).toHaveBeenCalledWith(
        'SnapController:getSnapState',
        MOCK_SNAP_ID,
        true,
      );
      expect(response).toStrictEqual({
        jsonrpc: '2.0',
        id: 1,
        result: 'bar',
      });
    });

    it('returns the entire state if no key is specified', async () => {
      const { implementation } = getStateHandler;

      const getUnlockPromise = jest.fn().mockResolvedValue(undefined);
      const hooks = { getUnlockPromise };

      const messenger = getMessenger();

      const engine = new JsonRpcEngine();

      engine.push(createOriginMiddleware(MOCK_SNAP_ID));
      engine.push((request, response, next, end) => {
        const result = implementation(
          request as JsonRpcRequestWithOrigin<GetStateParameters>,
          response,
          next,
          end,
          hooks,
          messenger,
        );

        result?.catch(end);
      });

      const response = await engine.handle({
        jsonrpc: '2.0',
        id: 1,
        method: 'snap_getState',
        params: {},
      });

      expect(messenger.call).toHaveBeenCalledWith(
        'SnapController:getSnapState',
        MOCK_SNAP_ID,
        true,
      );
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

      const getUnlockPromise = jest.fn().mockResolvedValue(undefined);
      const hooks = { getUnlockPromise };

      const messenger = getMessenger();

      const engine = new JsonRpcEngine();

      engine.push(createOriginMiddleware(MOCK_SNAP_ID));
      engine.push((request, response, next, end) => {
        const result = implementation(
          request as JsonRpcRequestWithOrigin<GetStateParameters>,
          response,
          next,
          end,
          hooks,
          messenger,
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

      expect(messenger.call).toHaveBeenCalledWith(
        'SnapController:getSnapState',
        MOCK_SNAP_ID,
        false,
      );
      expect(response).toStrictEqual({
        jsonrpc: '2.0',
        id: 1,
        result: 'bar',
      });
    });

    it('throws if the requesting origin does not have the required permission', async () => {
      const { implementation } = getStateHandler;

      const getUnlockPromise = jest.fn().mockResolvedValue(undefined);
      const hooks = { getUnlockPromise };

      const messenger = getMessenger();

      messenger.registerActionHandler(
        'PermissionController:hasPermission',
        () => false,
      );

      const engine = new JsonRpcEngine();

      engine.push(createOriginMiddleware(MOCK_SNAP_ID));
      engine.push((request, response, next, end) => {
        const result = implementation(
          request as JsonRpcRequestWithOrigin<GetStateParameters>,
          response,
          next,
          end,
          hooks,
          messenger,
        );

        result?.catch(end);
      });

      const response = await engine.handle({
        jsonrpc: '2.0',
        id: 1,
        method: 'snap_getState',
        params: {},
      });

      expect(messenger.call).not.toHaveBeenCalledWith(
        'SnapController:getSnapState',
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

    it('returns the state for multiple keys', async () => {
      const { implementation } = getStateHandler;

      const getUnlockPromise = jest.fn().mockResolvedValue(undefined);
      const hooks = { getUnlockPromise };

      const messenger = getMessenger();

      messenger.registerActionHandler(
        'SnapController:getSnapState',
        async () => ({ foo: 'bar', baz: 'qux' }),
      );

      const engine = new JsonRpcEngine();

      engine.push(createOriginMiddleware(MOCK_SNAP_ID));
      engine.push((request, response, next, end) => {
        const result = implementation(
          request as JsonRpcRequestWithOrigin<GetStateParameters>,
          response,
          next,
          end,
          hooks,
          messenger,
        );

        result?.catch(end);
      });

      const response = await engine.handle({
        jsonrpc: '2.0',
        id: 1,
        method: 'snap_getState',
        params: {
          key: ['foo', 'baz'],
        },
      });

      expect(response).toStrictEqual({
        jsonrpc: '2.0',
        id: 1,
        result: {
          foo: 'bar',
          baz: 'qux',
        },
      });
    });

    it('maps missing keys to `null` when an array of keys is provided', async () => {
      const { implementation } = getStateHandler;

      const getUnlockPromise = jest.fn().mockResolvedValue(undefined);
      const hooks = { getUnlockPromise };

      const messenger = getMessenger();

      const engine = new JsonRpcEngine();

      engine.push(createOriginMiddleware(MOCK_SNAP_ID));
      engine.push((request, response, next, end) => {
        const result = implementation(
          request as JsonRpcRequestWithOrigin<GetStateParameters>,
          response,
          next,
          end,
          hooks,
          messenger,
        );

        result?.catch(end);
      });

      const response = await engine.handle({
        jsonrpc: '2.0',
        id: 1,
        method: 'snap_getState',
        params: {
          key: ['foo', 'missing'],
        },
      });

      expect(response).toStrictEqual({
        jsonrpc: '2.0',
        id: 1,
        result: {
          foo: 'bar',
          missing: null,
        },
      });
    });

    it('throws if the parameters are invalid', async () => {
      const { implementation } = getStateHandler;

      const getUnlockPromise = jest.fn().mockResolvedValue(undefined);
      const hooks = { getUnlockPromise };

      const messenger = getMessenger();

      const engine = new JsonRpcEngine();

      engine.push(createOriginMiddleware(MOCK_SNAP_ID));
      engine.push((request, response, next, end) => {
        const result = implementation(
          request as JsonRpcRequestWithOrigin<GetStateParameters>,
          response,
          next,
          end,
          hooks,
          messenger,
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

  it('returns a record of values when an array of keys is provided', () => {
    const state = { a: { b: { c: 'value' } }, d: 'other' };
    expect(get(state, ['a.b.c', 'd'])).toStrictEqual({
      'a.b.c': 'value',
      d: 'other',
    });
  });

  it('returns an empty object when an empty array is provided', () => {
    expect(get(object, [])).toStrictEqual({});
  });

  it('maps missing keys to `null` in array mode', () => {
    expect(get(object, ['a.b.c', 'a.b.missing'])).toStrictEqual({
      'a.b.c': 'value',
      'a.b.missing': null,
    });
  });

  it('throws if an array key contains a forbidden segment', () => {
    expect(() => get(object, ['a.b.c', '__proto__.polluted'])).toThrow(
      'Invalid params: Key contains forbidden characters.',
    );
  });
});

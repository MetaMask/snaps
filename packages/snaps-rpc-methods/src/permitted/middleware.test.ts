import { JsonRpcEngine } from '@metamask/json-rpc-engine';
import type { MockAnyNamespace } from '@metamask/messenger';
import { MOCK_ANY_NAMESPACE, Messenger } from '@metamask/messenger';
import { rpcErrors, serializeError } from '@metamask/rpc-errors';
import {
  MOCK_SNAP_ID,
  getTruncatedSnap,
} from '@metamask/snaps-utils/test-utils';

import type { PermittedRpcMethodActions } from '.';
import { createSnapsMethodMiddleware } from './middleware';

describe('createSnapsMethodMiddleware', () => {
  const getHooks = () => ({
    getAllowedKeyringMethods: jest.fn(),
    getIsActive: jest.fn(),
    getVersion: jest.fn(),
    getUnlockPromise: jest.fn(),
    trackError: jest.fn(),
    trackEvent: jest.fn(),
    startTrace: jest.fn(),
    endTrace: jest.fn(),
    getMessenger: jest.fn(),
  });

  const getMessenger = () =>
    new Messenger<MockAnyNamespace, PermittedRpcMethodActions>({
      namespace: MOCK_ANY_NAMESPACE,
    });

  it('supports wallet_getSnaps', async () => {
    const messenger = getMessenger();

    messenger.registerActionHandler('SnapController:getPermittedSnaps', () => ({
      [MOCK_SNAP_ID]: getTruncatedSnap(),
    }));

    const middleware = createSnapsMethodMiddleware(true, getHooks(), messenger);

    const engine = new JsonRpcEngine();

    engine.push(middleware);

    const request = {
      jsonrpc: '2.0' as const,
      id: 1,
      method: 'wallet_getSnaps',
      params: {},
    };

    expect(await engine.handle(request)).toStrictEqual({
      id: 1,
      jsonrpc: '2.0',
      result: { [MOCK_SNAP_ID]: getTruncatedSnap() },
    });
  });

  it('blocks snap_ prefixed RPC methods for non-snaps', async () => {
    const middleware = createSnapsMethodMiddleware(
      false,
      getHooks(),
      getMessenger(),
    );

    const engine = new JsonRpcEngine();

    engine.push(middleware);

    const request = {
      jsonrpc: '2.0' as const,
      id: 1,
      method: 'snap_getFile',
      params: {},
    };

    expect(await engine.handle(request)).toStrictEqual({
      id: 1,
      jsonrpc: '2.0',
      error: expect.objectContaining(
        serializeError(rpcErrors.methodNotFound(), {
          shouldIncludeStack: false,
        }),
      ),
    });
  });

  it('handles errors', async () => {
    const messenger = getMessenger();

    messenger.registerActionHandler('SnapController:getPermittedSnaps', () => {
      throw new Error('foo');
    });

    const middleware = createSnapsMethodMiddleware(true, getHooks(), messenger);

    const engine = new JsonRpcEngine();

    engine.push(middleware);

    const request = {
      jsonrpc: '2.0' as const,
      id: 1,
      method: 'wallet_getSnaps',
      params: {},
    };

    expect(await engine.handle(request)).toStrictEqual({
      id: 1,
      jsonrpc: '2.0',
      error: {
        code: -32603,
        data: {
          cause: expect.objectContaining({ message: 'foo' }),
        },
        message: 'foo',
      },
    });
  });

  it('ignores unknown methods', async () => {
    const middleware = createSnapsMethodMiddleware(
      true,
      getHooks(),
      getMessenger(),
    );

    const engine = new JsonRpcEngine();

    engine.push(middleware);

    const request = {
      jsonrpc: '2.0' as const,
      id: 1,
      method: 'snap_dialog',
      params: {},
    };

    // Since we only have one middleware, this will return an error on a successful test.
    expect(await engine.handle(request)).toStrictEqual({
      id: 1,
      jsonrpc: '2.0',
      error: {
        code: -32603,
        data: {
          cause: null,
          request: {
            id: 1,
            jsonrpc: '2.0',
            method: 'snap_dialog',
            params: {},
          },
        },
        message: expect.stringContaining(
          'JsonRpcEngine: Response has no error or result for request',
        ),
        stack: expect.stringContaining(
          'JsonRpcEngine: Response has no error or result for request',
        ),
      },
    });
  });
});

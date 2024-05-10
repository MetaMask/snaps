import { JsonRpcEngine } from '@metamask/json-rpc-engine';
import { rpcErrors, serializeError } from '@metamask/rpc-errors';
import {
  MOCK_SNAP_ID,
  getTruncatedSnap,
} from '@metamask/snaps-utils/test-utils';
import { jsonrpc2 } from '@metamask/utils';

import {
  createSnapsMethodMiddleware,
  createSnapsMethodRemapMiddleware,
} from './middleware';

describe('createSnapsMethodMiddleware', () => {
  it('supports wallet_getSnaps', async () => {
    const middleware = createSnapsMethodMiddleware(true, {
      getSnaps: () => ({ [MOCK_SNAP_ID]: getTruncatedSnap() }),
    });

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
    const middleware = createSnapsMethodMiddleware(false, {});

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
    const middleware = createSnapsMethodMiddleware(true, {
      getSnaps: () => {
        throw new Error('foo');
      },
    });

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
        message: 'Internal JSON-RPC error.',
      },
    });
  });

  it('ignores unknown methods', async () => {
    const middleware = createSnapsMethodMiddleware(true, {});

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

describe('createSnapsMethodRemapMiddleware', () => {
  const mockMethodName = 'foo';
  const getMockHandlerMap = () => ({
    [mockMethodName]: {
      implementation: jest.fn(),
    },
  });
  const getMockRequest = () => ({
    jsonrpc: jsonrpc2,
    id: 1,
    method: mockMethodName,
  });
  const getMockResponse = () => ({
    jsonrpc: jsonrpc2,
    id: 'foo',
    result: null,
  });

  // Exports coverage
  it('creates a middleware function', () => {
    const middleware = createSnapsMethodRemapMiddleware();
    expect(typeof middleware).toBe('function');
  });

  it('calls remap handlers', () => {
    const handlers = getMockHandlerMap();
    // @ts-expect-error Intentional destructive testing
    const middleware = createSnapsMethodRemapMiddleware(handlers);
    const nextMock = jest.fn();
    const endMock = jest.fn();

    middleware(getMockRequest(), getMockResponse(), nextMock, endMock);

    expect(handlers[mockMethodName].implementation).toHaveBeenCalledTimes(1);
    expect(nextMock).not.toHaveBeenCalled();
    expect(endMock).not.toHaveBeenCalled();
  });

  it('forwards requests for methods without a remap handler', () => {
    // @ts-expect-error Intentional destructive testing
    const middleware = createSnapsMethodRemapMiddleware({});
    const nextMock = jest.fn();
    const endMock = jest.fn();

    middleware(getMockRequest(), getMockResponse(), nextMock, endMock);

    expect(nextMock).toHaveBeenCalledTimes(1);
    expect(endMock).not.toHaveBeenCalled();
  });
});

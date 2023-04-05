import {
  MOCK_SNAP_ID,
  getTruncatedSnap,
} from '@metamask/snaps-utils/test-utils';
import { JsonRpcEngine } from 'json-rpc-engine';

import { createSnapsMethodMiddleware } from './middleware';

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
          originalError: {},
        },
        message: 'foo',
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

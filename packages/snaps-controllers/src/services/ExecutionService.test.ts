import { BasePostMessageStream } from '@metamask/post-message-stream';
import { HandlerType } from '@metamask/snaps-utils';
import { MOCK_SNAP_ID } from '@metamask/snaps-utils/test-utils';
import { Duration, inMilliseconds } from '@metamask/utils';
import type { IncomingHttpHeaders } from 'http';
import { createServer } from 'http';
import type { AddressInfo } from 'net';

import type { ExecutionServiceArgs } from './ExecutionService';
import { NodeThreadExecutionService } from './node';
import { createService } from '../test-utils';

class MockExecutionService extends NodeThreadExecutionService {
  constructor({ messenger, setupSnapProvider, ...args }: ExecutionServiceArgs) {
    super({
      ...args,
      messenger,
      setupSnapProvider,
      initTimeout: inMilliseconds(5, Duration.Second),
    });
  }
}

describe('ExecutionService', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('throws an error if RPC request handler is unavailable', async () => {
    const { service } = createService(MockExecutionService);
    await expect(
      service.handleRpcRequest(MOCK_SNAP_ID, {
        origin: 'foo.com',
        handler: HandlerType.OnRpcRequest,
        request: {
          id: 6,
          method: 'bar',
        },
      }),
    ).rejects.toThrow(`"${MOCK_SNAP_ID}" is not currently running.`);
  });

  it('throws an error if execution environment fails to respond to ping', async () => {
    const { service } = createService(MockExecutionService, {
      pingTimeout: inMilliseconds(1, Duration.Second),
    });

    class MockStream extends BasePostMessageStream {
      protected _postMessage(_data?: unknown): void {
        // no-op
      }
    }

    // @ts-expect-error Accessing private property and returning unusable worker.
    service.initEnvStream = async () =>
      Promise.resolve({ worker: null, stream: new MockStream() });

    await expect(
      service.executeSnap({
        snapId: MOCK_SNAP_ID,
        sourceCode: `
        console.log('foo');
      `,
        endowments: ['console'],
      }),
    ).rejects.toThrow(
      'The executor for "npm:@metamask/example-snap" was unreachable. The executor did not respond in time.',
    );
  });

  it('throws an error if execution environment fails to start initialization', async () => {
    const { service } = createService(MockExecutionService);

    // @ts-expect-error Accessing private property and returning unusable worker.
    service.initEnvStream = async () =>
      new Promise((_resolve) => {
        // no-op
      });

    await expect(
      service.executeSnap({
        snapId: MOCK_SNAP_ID,
        sourceCode: `
        console.log('foo');
      `,
        endowments: ['console'],
      }),
    ).rejects.toThrow(
      `The executor for "npm:@metamask/example-snap" couldn't start initialization. The offscreen document may not exist.`,
    );
  });

  it('throws an error if execution environment fails to init', async () => {
    const { service } = createService(MockExecutionService);

    // @ts-expect-error Accessing private property and returning unusable worker.
    service.initEnvStream = async (snapId: string) =>
      new Promise((_resolve) => {
        // @ts-expect-error Accessing private property to mirror updating state
        service.setSnapStatus(snapId, 'initializing');
        // no-op
      });

    await expect(
      service.executeSnap({
        snapId: MOCK_SNAP_ID,
        sourceCode: `
        console.log('foo');
      `,
        endowments: ['console'],
      }),
    ).rejects.toThrow(
      'The executor for "npm:@metamask/example-snap" failed to initialize. The iframe/webview/worker failed to load.',
    );
  });

  it('throws an error if Snap fails to init', async () => {
    const { service } = createService(MockExecutionService);

    await expect(
      service.executeSnap({
        snapId: MOCK_SNAP_ID,
        sourceCode: `
        while(true) {}
      `,
        endowments: ['console'],
      }),
    ).rejects.toThrow(`${MOCK_SNAP_ID} failed to start.`);
  });

  it('throws an error if the Snap is already running when trying to execute', async () => {
    const { service } = createService(MockExecutionService);

    await service.executeSnap({
      snapId: MOCK_SNAP_ID,
      sourceCode: `module.exports.onRpcRequest = () => {};`,
      endowments: [],
    });

    await expect(
      service.executeSnap({
        snapId: MOCK_SNAP_ID,
        sourceCode: `module.exports.onRpcRequest = () => {};`,
        endowments: [],
      }),
    ).rejects.toThrow(`"${MOCK_SNAP_ID}" is already running.`);
  });

  it('does nothing if the Snap is not running when attempted to be terminated', async () => {
    const { service } = createService(MockExecutionService);

    expect(await service.terminateSnap(MOCK_SNAP_ID)).toBeUndefined();
  });

  it('attaches the trace context to fetches made by the Snap', async () => {
    const receivedHeaders: IncomingHttpHeaders[] = [];
    const server = createServer((request, response) => {
      receivedHeaders.push(request.headers);
      response.end('OK');
    });
    await new Promise<void>((resolve) => server.listen(0, resolve));
    const { port } = server.address() as AddressInfo;

    const { service } = createService(MockExecutionService);
    try {
      await service.executeSnap({
        snapId: MOCK_SNAP_ID,
        sourceCode: `
        module.exports.onRpcRequest = () =>
          fetch('http://localhost:${port}').then((response) => response.text());
      `,
        endowments: ['fetch'],
      });

      const traceparent =
        '00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01';
      const result = await service.handleRpcRequest(MOCK_SNAP_ID, {
        origin: 'foo.com',
        handler: HandlerType.OnRpcRequest,
        request: { jsonrpc: '2.0', id: 1, method: 'foo' },
        traceContext: {
          traceparent,
          baggage: 'a=b',
          origins: [`http://localhost:${port}`],
        },
      });

      expect(result).toBe('OK');
      expect(receivedHeaders).toHaveLength(1);
      expect(receivedHeaders[0]).toStrictEqual(
        expect.objectContaining({ traceparent, baggage: 'a=b' }),
      );
    } finally {
      await service.terminateAllSnaps();
      server.closeAllConnections();
      await new Promise((resolve) => server.close(resolve));
    }
  });
});

import { BasePostMessageStream } from '@metamask/post-message-stream';
import { HandlerType } from '@metamask/snaps-utils';
import { MOCK_SNAP_ID } from '@metamask/snaps-utils/test-utils';
import { Duration, inMilliseconds } from '@metamask/utils';

import type { ExecutionServiceArgs } from './AbstractExecutionService';
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

describe('AbstractExecutionService', () => {
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
    const { service } = createService(MockExecutionService);

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
    ).rejects.toThrow('The Snaps execution environment failed to start.');
  });

  it('throws an error if execution environment fails to init', async () => {
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
    ).rejects.toThrow('The Snaps execution environment failed to start.');
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

  it('throws an error if the Snap is not running when attempted to be terminated', async () => {
    const { service } = createService(MockExecutionService);

    await expect(service.terminateSnap(MOCK_SNAP_ID)).rejects.toThrow(
      `"${MOCK_SNAP_ID}" is not currently running.`,
    );
  });
});

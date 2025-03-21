// eslint-disable-next-line import-x/no-unassigned-import
import 'ses';
import { HandlerType } from '@metamask/snaps-utils';
import type { SpyFunction } from '@metamask/snaps-utils/test-utils';
import {
  MOCK_ORIGIN,
  MOCK_SNAP_ID,
  MockWindowPostMessageStream,
  spy,
} from '@metamask/snaps-utils/test-utils';
import { describe, expect, it, beforeAll, beforeEach } from 'vitest';

import { WebWorkerSnapExecutor } from './WebWorkerSnapExecutor';

/**
 * Write a message to the stream, wrapped with the job ID.
 *
 * @param stream - The stream to write to.
 * @param message - The message to write.
 */
function writeMessage(
  stream: MockWindowPostMessageStream,
  message: Record<string, unknown>,
) {
  stream.write(message);
}

/**
 * Wait for a response from the stream.
 *
 * @param stream - The stream to wait for a response on.
 * @returns The raw JSON-RPC response object.
 */
async function getResponse(
  stream: MockWindowPostMessageStream,
): Promise<Record<string, unknown>> {
  return new Promise((resolve) => {
    stream.once('response', (data) => {
      resolve(data);
    });
  });
}

describe.skip('WebWorkerSnapExecutor', () => {
  let consoleSpy: SpyFunction<unknown, unknown>;

  beforeAll(() => {
    // @ts-expect-error - `globalThis.process` is not optional.
    delete globalThis.process;

    // SES makes the `console.error` property non-writable, so we have to
    // create the spy before lockdown.
    consoleSpy = spy(console, 'error');

    lockdown({
      domainTaming: 'unsafe',
      errorTaming: 'unsafe',
      stackFiltering: 'verbose',
    });
  });

  beforeEach(() => {
    consoleSpy.clear();
  });

  it('receives and processes commands', async () => {
    const mockStream = new MockWindowPostMessageStream();

    // Initialize
    WebWorkerSnapExecutor.initialize(mockStream);

    writeMessage(mockStream, {
      name: 'command',
      data: {
        jsonrpc: '2.0',
        id: 1,
        method: 'ping',
      },
    });

    expect(await getResponse(mockStream)).toStrictEqual({
      jsonrpc: '2.0',
      id: 1,
      result: 'OK',
    });

    const CODE = `
      exports.onRpcRequest = () => {
        return 'foobar';
      };
    `;

    writeMessage(mockStream, {
      name: 'command',
      data: {
        jsonrpc: '2.0',
        id: 2,
        method: 'executeSnap',
        params: [MOCK_SNAP_ID, CODE, []],
      },
    });

    expect(await getResponse(mockStream)).toStrictEqual({
      jsonrpc: '2.0',
      id: 2,
      result: 'OK',
    });

    writeMessage(mockStream, {
      name: 'command',
      data: {
        jsonrpc: '2.0',
        id: 3,
        method: 'snapRpc',
        params: [
          MOCK_SNAP_ID,
          HandlerType.OnRpcRequest,
          MOCK_ORIGIN,
          { jsonrpc: '2.0', method: '' },
        ],
      },
    });

    expect(await getResponse(mockStream)).toStrictEqual({
      result: 'foobar',
      id: 3,
      jsonrpc: '2.0',
    });
  });

  // TODO: Re-enable this test after investigating error handling further.

  it.skip('handles closing the stream', async () => {
    const mockStream = new MockWindowPostMessageStream();

    // We have to mock close, because otherwise WebDriverIO will break.
    const closeSpy = spy(globalThis, 'close').mockImplementation(() => {
      // Do nothing
    });

    WebWorkerSnapExecutor.initialize(mockStream);
    mockStream.destroy();

    await new Promise((resolve) => setTimeout(resolve, 1));

    expect(closeSpy.calls).toHaveLength(1);

    closeSpy.reset();
  });

  // TODO: Re-enable this test after investigating error handling further.

  it.skip('handles stream errors', async () => {
    const mockStream = new MockWindowPostMessageStream();

    // We have to mock close, because otherwise WebDriverIO will break.
    const closeSpy = spy(globalThis, 'close').mockImplementation(() => {
      // Do nothing
    });

    WebWorkerSnapExecutor.initialize(mockStream);
    mockStream.emit('error', new Error('test error'));

    expect(closeSpy.calls).toHaveLength(1);
    expect(consoleSpy.calls).toHaveLength(3);
    expect(consoleSpy.calls[0].args[0]).toBe(
      'Parent stream failure, closing worker.',
    );

    closeSpy.reset();
  });
});

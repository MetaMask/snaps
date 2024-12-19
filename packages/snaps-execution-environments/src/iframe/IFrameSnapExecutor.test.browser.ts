// eslint-disable-next-line import/no-unassigned-import
import 'ses';
import { HandlerType } from '@metamask/snaps-utils';
import {
  MOCK_ORIGIN,
  MOCK_SNAP_ID,
  MockWindowPostMessageStream,
} from '@metamask/snaps-utils/test-utils';

import { IFrameSnapExecutor } from './IFrameSnapExecutor';

/**
 * Write a message to the stream, wrapped with the job ID and frame URL.
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

describe('IFrameSnapExecutor', () => {
  before(() => {
    // @ts-expect-error - `globalThis.process` is not optional.
    delete globalThis.process;

    lockdown({
      domainTaming: 'unsafe',
      errorTaming: 'unsafe',
      stackFiltering: 'verbose',
    });
  });

  it('receives and processes commands', async () => {
    const mockStream = new MockWindowPostMessageStream();

    // Initialize
    IFrameSnapExecutor.initialize(mockStream);

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
});

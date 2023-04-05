import { MockPostMessageStream, spy } from '@metamask/snaps-utils/test-utils';
import { assert } from '@metamask/utils';

import { WebWorkerPool } from './WebWorkerPool';

const MOCK_JOB_ID = 'job-id';
const WORKER_URL = 'http://localhost:4568/worker/executor/';

/**
 * Write a message to the stream, wrapped with the job ID.
 *
 * @param stream - The stream to write to.
 * @param message - The message to write.
 * @param jobId - The job ID.
 */
function writeMessage(
  stream: MockPostMessageStream,
  message: Record<string, unknown>,
  jobId = MOCK_JOB_ID,
) {
  stream.write({
    jobId,
    data: message,
  });
}

/**
 * Write a termination message to the stream.
 *
 * @param stream - The stream to write to.
 * @returns A promise that resolves after 1 millisecond.
 */
async function terminateJob(stream: MockPostMessageStream) {
  writeMessage(stream, {
    jsonrpc: '2.0',
    id: 2,
    method: 'terminateJob',
  });

  return await new Promise((resolve) => setTimeout(resolve, 1));
}

/**
 * Wait for a response from the stream.
 *
 * @param stream - The stream to wait for a response on.
 * @returns The raw JSON-RPC response object.
 */
async function getResponse(
  stream: MockPostMessageStream,
): Promise<Record<string, unknown>> {
  return new Promise((resolve) => {
    stream.once('response', (data) => {
      resolve(data);
    });
  });
}

describe('WebWorkerPool', () => {
  it('forwards messages to the worker', async () => {
    const mockStream = new MockPostMessageStream();

    WebWorkerPool.initialize(mockStream, WORKER_URL);

    writeMessage(mockStream, {
      name: 'command',
      data: {
        jsonrpc: '2.0',
        id: 1,
        method: 'ping',
      },
    });

    // eslint-disable-next-line jest/prefer-strict-equal
    expect(await getResponse(mockStream)).toEqual({
      jsonrpc: '2.0',
      id: 1,
      result: 'OK',
    });

    expect(document.getElementById(MOCK_JOB_ID)).toBeDefined();

    await terminateJob(mockStream);
  });

  it('terminates the worker', async () => {
    const mockStream = new MockPostMessageStream();

    const executor = WebWorkerPool.initialize(mockStream, WORKER_URL);

    // Send ping to ensure that the worker is created.
    writeMessage(mockStream, {
      name: 'command',
      data: {
        jsonrpc: '2.0',
        id: 1,
        method: 'ping',
      },
    });

    // Wait for the response, so that we know the worker is created.
    await getResponse(mockStream);

    const worker = executor.jobs.get(MOCK_JOB_ID);

    assert(worker);
    const terminateSpy = spy(worker.worker, 'terminate');

    await terminateJob(mockStream);

    expect(executor.jobs.get(MOCK_JOB_ID)).toBeUndefined();
    expect(terminateSpy.calls.length).toBe(1);
  });

  it('creates a worker pool', async () => {
    const mockStream = new MockPostMessageStream();

    const executor = WebWorkerPool.initialize(mockStream, WORKER_URL);
    expect(executor.pool.length).toBe(0);

    // Send ping to ensure that the worker is created.
    writeMessage(mockStream, {
      name: 'command',
      data: {
        jsonrpc: '2.0',
        id: 1,
        method: 'ping',
      },
    });

    // Wait for the response, so that we know the worker is created.
    await getResponse(mockStream);

    expect(executor.pool.length).toBe(3);
    const nextWorker = executor.pool[0];

    writeMessage(
      mockStream,
      {
        name: 'command',
        data: {
          jsonrpc: '2.0',
          id: 2,
          method: 'ping',
        },
      },
      'job-id-2',
    );

    // Wait for the response, so that we know the worker is created.
    await getResponse(mockStream);

    expect(executor.pool.length).toBe(3);
    expect(executor.pool[0]).not.toBe(nextWorker);
  });

  it('handles errors', async () => {
    const mockStream = new MockPostMessageStream();

    const fetchSpy = spy(globalThis, 'fetch').mockImplementation(() => {
      throw new Error('Failed to fetch.');
    });

    WebWorkerPool.initialize(mockStream, WORKER_URL);

    writeMessage(mockStream, {
      name: 'command',
      data: {
        jsonrpc: '2.0',
        id: 1,
        method: 'ping',
      },
    });

    // Wait for the response, so that we know the worker is created.
    const response = await getResponse(mockStream);
    expect(response).toStrictEqual({
      jsonrpc: '2.0',
      id: null,
      error: {
        code: -32000,
        message: 'Internal error',
      },
    });

    expect(fetchSpy.calls.length).toBe(1);
  });
});

import {
  fixCreateWindow,
  MockPostMessageStream,
  startServer,
  stopServer,
} from '@metamask/snaps-utils/test-utils';
import http from 'http';

import { OffscreenSnapExecutor } from './OffscreenSnapExecutor';

const SERVER_PORT = 6365;
const IFRAME_URL = `http://localhost:${SERVER_PORT}/`;

const MOCK_JOB_ID = 'job-id';

jest.setTimeout(5000);

jest.mock('@metamask/snaps-utils', () => {
  const actual = jest.requireActual('@metamask/snaps-utils');
  return {
    ...actual,
    createWindow: (...args: Parameters<typeof fixCreateWindow>) =>
      fixCreateWindow(...args),
  };
});

/**
 * Set a event source and origin for post message events.
 *
 * @param service - The execution service.
 * @returns A teardown function.
 */
function fixPostMessageEventSource(service: OffscreenSnapExecutor) {
  const listener = (event: MessageEvent) => {
    if (event.source === null && !event.origin) {
      let source;
      let origin;
      if (event.data.target === 'child') {
        source = window;
        origin = window.location.origin;
      } else if (event.data.target === 'parent') {
        source = service.jobs[MOCK_JOB_ID].window;
        origin = IFRAME_URL;
      }

      if (event.data.target) {
        event.stopImmediatePropagation();
        const args = Object.assign({
          ...event,
          data: event.data,
          source,
          origin,
        });

        const eventWithOrigin: MessageEvent = new MessageEvent('message', args);
        window.dispatchEvent(eventWithOrigin);
      }
    }
  };

  window.addEventListener('message', listener);

  return () => {
    window.removeEventListener('message', listener);
  };
}

/**
 * Write a message to the stream, wrapped with the job ID and frame URL.
 *
 * @param stream - The stream to write to.
 * @param message - The message to write.
 */
function writeMessage(
  stream: MockPostMessageStream,
  message: Record<string, unknown>,
) {
  stream.write({
    jobId: MOCK_JOB_ID,
    frameUrl: IFRAME_URL,
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

describe('OffscreenSnapExecutor', () => {
  let server: http.Server | undefined;

  // The tests start running before the server is ready if we don't use the done
  // callback.
  // eslint-disable-next-line jest/no-done-callback
  beforeAll((done) => {
    startServer(SERVER_PORT)
      .then((newServer) => {
        server = newServer;
        done();
      })
      .catch(done.fail);
  });

  // eslint-disable-next-line jest/no-done-callback, consistent-return
  afterAll((done) => {
    // `server` is undefined if the server failed to start. This is unlikely to
    // happen, but we check it anyway to keep TypeScript happy.
    if (!server) {
      return done();
    }

    stopServer(server).then(done).catch(done.fail);
  });

  it('forwards messages to the iframe', async () => {
    const mockStream = new MockPostMessageStream();

    const executor = OffscreenSnapExecutor.initialize(mockStream);
    const teardown = fixPostMessageEventSource(executor);

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
    teardown();
  });

  it('terminates the iframe', async () => {
    const mockStream = new MockPostMessageStream();

    const executor = OffscreenSnapExecutor.initialize(mockStream);
    const teardown = fixPostMessageEventSource(executor);

    // Send ping to ensure that the iframe is created.
    writeMessage(mockStream, {
      name: 'command',
      data: {
        jsonrpc: '2.0',
        id: 1,
        method: 'ping',
      },
    });

    // Wait for the response, so that we know the iframe is created.
    await getResponse(mockStream);
    await terminateJob(mockStream);

    expect(executor.jobs[MOCK_JOB_ID]).toBeUndefined();
    expect(document.getElementById(MOCK_JOB_ID)).toBeNull();

    teardown();
  });
});

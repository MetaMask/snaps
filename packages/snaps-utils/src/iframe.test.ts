import { startServer, stopServer } from '@metamask/snaps-utils/test-utils';
import http from 'http';

import { createWindow } from './iframe';

const SERVER_PORT = 6366;
const IFRAME_URL = `http://localhost:${SERVER_PORT}/`;

const MOCK_JOB_ID = 'job-id';

jest.setTimeout(5000);

describe('createWindow', () => {
  let server: http.Server;

  // The tests start running before the server is ready if we don't use the done
  // callback.
  // eslint-disable-next-line jest/no-done-callback
  beforeAll((done) => {
    // We use the current directory as the bundle path, as the test doesn't
    // actually use the bundle. We just need to serve something so the iframe
    // can load.
    startServer(SERVER_PORT, '.')
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

  it('creates an iframe window with the provided job ID as the iframe ID', async () => {
    const window = await createWindow(IFRAME_URL, MOCK_JOB_ID);
    const iframe = document.getElementById(MOCK_JOB_ID) as HTMLIFrameElement;

    expect(iframe).toBeDefined();
    expect(iframe.contentWindow).toBe(window);
    expect(iframe.id).toBe(MOCK_JOB_ID);

    // Jest shares the same JSDOM instance between tests, so we need to clean up
    // after ourselves.
    iframe.remove();
  });
});

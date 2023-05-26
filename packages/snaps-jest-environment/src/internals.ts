import {
  assert,
  createModuleLogger,
  createProjectLogger,
} from '@metamask/utils';
import { createServer, Server } from 'http';
import { join } from 'path';
import serveHandler from 'serve-handler';

declare global {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface Window {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __SIMULATOR_API__: {
      getState: () => any;
    };
  }
}

const PUBLIC_PATH = join(__dirname, '..', 'public');

export const rootLogger = createProjectLogger('snaps-jest-environment');

/**
 * Start a HTTP server on `localhost` with a random port. This is used to serve
 * the static files for the environment.
 *
 * @returns The HTTP server.
 */
export async function startServer() {
  const log = createModuleLogger(rootLogger, 'server');
  const server = createServer((request, response) => {
    serveHandler(request, response, {
      public: PUBLIC_PATH,
    }).catch((error) => {
      log(error);
      response.statusCode = 500;
      response.end();
    });
  });

  return await new Promise<Server>((resolve) => {
    server.listen(0, () => {
      resolve(server);
    });
  });
}

/**
 * Get the Snaps environment. This asserts that the environment has been
 * configured.
 *
 * @returns The Snaps environment.
 */
export function getEnvironment() {
  assert(
    snapsEnvironment,
    'Snaps environment not found. Make sure you have configured the environment correctly.',
  );

  return snapsEnvironment;
}

/**
 * Get a JSON-RPC response. This is assumed to be used after a JSON-RPC request
 * has been sent.
 *
 * @returns The JSON-RPC response.
 */
export async function getResponse() {
  const { browser } = getEnvironment();
  await browser.$(`[data-testid="send-request-button-done"]`).waitForExist({
    timeout: 60000,
    timeoutMsg: 'Timed out waiting for response.',
  });

  const state = await browser.execute(() => {
    // Get the state from the injected API.
    return window.__SIMULATOR_API__.getState();
  });

  // For some reason we have to copy the object in order for
  // `expect().toStrictEqual()` to work.
  return JSON.parse(JSON.stringify(state.onRpcRequest.response));
}

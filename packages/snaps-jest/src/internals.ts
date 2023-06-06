import {
  assert,
  createModuleLogger,
  createProjectLogger,
} from '@metamask/utils';
import { createServer, Server } from 'http';
import { join } from 'path';
import { waitFor as waitForPuppeteer } from 'pptr-testing-library';
import type { Page } from 'puppeteer-core/lib/esm/puppeteer/api/Page';
import serveHandler from 'serve-handler';

import { SnapResponse } from './types';

declare global {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface Window {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __SIMULATOR_API__: {
      dispatch: (action: { type: string; payload: unknown }) => void;
      subscribe: (listener: () => void) => () => void;
      getState: () => any;
      getRequestId: () => string;
      getNotifications: (
        requestId: string,
      ) => { id: string; message: string }[];
    };
  }
}

const PUBLIC_PATH = join(__dirname, '..', 'public');

export const rootLogger = createProjectLogger('snaps-jest');

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
 * Wait for a JSON-RPC response.
 *
 * @param page - The page to wait for the response on.
 * @param type - The type of response to wait for.
 * @returns The JSON-RPC response.
 */
export async function waitForResponse(page: Page, type: 'onRpcRequest') {
  return await page.evaluate(async (_type) => {
    return new Promise<SnapResponse['response']>((resolve) => {
      const unsubscribe = window.__SIMULATOR_API__.subscribe(() => {
        const state = window.__SIMULATOR_API__.getState();

        if (!state[_type].pending && state[_type].response) {
          unsubscribe();
          resolve(state[_type].response);
        }
      });
    });
  }, type);
}

/**
 * Get the text of the notifications.
 *
 * @param page - The page to get the notifications from.
 * @param requestId - The ID of the request to get the notifications for.
 * @returns The text of the notifications, in order of appearance.
 */
export async function getNotifications(page: Page, requestId: string) {
  return await page.evaluate((id) => {
    return window.__SIMULATOR_API__.getNotifications(id);
  }, requestId);
}

type WaitForOptions = {
  timeout?: number;
  message?: string;
};

/**
 * Wait for a condition to be true. This is a wrapper around
 * `pptr-testing-library`'s `waitFor` function, with the addition of a custom
 * error message.
 *
 * @param fn - The condition to wait for.
 * @param options - The options.
 * @param options.timeout - The timeout in milliseconds.
 * @param options.message - The error message to throw if the condition is not
 * met.
 * @returns A promise that resolves when the condition is met.
 */
export async function waitFor(
  fn: () => Promise<unknown>,
  { timeout = 3000, message }: WaitForOptions = {},
) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    await waitForPuppeteer(async () => await fn(), {
      timeout,
    });
  } catch (error) {
    if (message) {
      throw new Error(message);
    }

    throw error;
  }
}

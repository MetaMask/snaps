import http from 'http';
import path from 'path';
import serveHandler from 'serve-handler';

import { logError } from '../logging';

/**
 * Starts a local server that serves the iframe execution environment.
 *
 * @param port - The port to start the server on.
 * @param bundlePath - The path to the bundle to serve. Defaults to the iframe
 * test bundle.
 * @returns The server instance.
 */
export async function startServer(
  port: number,
  bundlePath: string = require.resolve(
    '@metamask/snaps-execution-environments/__test__/iframe-test/bundle.js',
  ),
) {
  return new Promise<http.Server>((resolve, reject) => {
    if (!Number.isSafeInteger(port) || port < 0) {
      reject(new Error(`Invalid port: "${port}"`));
    }

    const publicPath = path.resolve(bundlePath, '../');

    const server = http.createServer((req, res) => {
      serveHandler(req, res, {
        public: publicPath,
        headers: [
          {
            source: '**/*',
            headers: [
              {
                key: 'Cache-Control',
                value: 'no-cache',
              },
            ],
          },
        ],
      }).catch(reject);
    });

    server.listen({ port }, () => {
      // eslint-disable-next-line no-console
      console.log(`Server listening on: http://localhost:${port}`);
      resolve(server);
    });

    server.on('error', (error) => {
      logError('Server error', error);
      reject(error);
    });

    server.on('close', () => {
      logError('Server closed');
      reject(new Error('Server closed'));
    });
  });
}

/**
 * Stops the local server.
 *
 * @param server - The server to stop.
 */
export async function stopServer(server: http.Server) {
  await new Promise<void>((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
}

/**
 * Fix for JSDOM not adding an origin or source to post message events. This
 * function is intended to be used as a mock for the `createWindow` function in
 * `@metamask/snaps-utils`.
 *
 * @param uri - The iframe URI.
 * @param jobId - The job id.
 * @returns A promise that resolves to the contentWindow of the iframe.
 * @example
 * ```typescript
 * jest.mock('@metamask/snaps-utils', () => {
 *   const actual = jest.requireActual('@metamask/snaps-utils');
 *   return {
 *     ...actual,
 *     createWindow: (...args: Parameters<typeof fixCreateWindow>) =>
 *       fixCreateWindow(...args),
 *   };
 * });
 * ```
 */
export async function fixCreateWindow(uri: string, jobId: string) {
  const window = await jest
    .requireActual('@metamask/snaps-utils')
    .createWindow(uri, jobId);

  const scriptElement = window.document.createElement('script');

  if (!scriptElement) {
    return window;
  }

  // Fix the inside window.
  scriptElement.textContent = `
    window.addEventListener('message', (postMessageEvent) => {
      if (postMessageEvent.source === null && !postMessageEvent.origin) {
        let source;
        let postMessageEventOrigin;
        if (postMessageEvent.data.target === 'child') {
          source = window.parent;
          postMessageEventOrigin = '*';
        } else if (postMessageEvent.data.target === 'parent') {
          source = window;
          postMessageEventOrigin = window.location.origin;
        }
        if (postMessageEvent.data.target) {
          postMessageEvent.stopImmediatePropagation();
          const args = Object.assign({
            ...postMessageEvent,
            data: postMessageEvent.data,
            source,
            origin: postMessageEventOrigin,
          });
          const postMessageEventWithOrigin = new MessageEvent(
            'message',
            args,
          );
          window.dispatchEvent(postMessageEventWithOrigin);
        }
      }
    });
  `;

  window.document.body.appendChild(scriptElement);

  return window;
}

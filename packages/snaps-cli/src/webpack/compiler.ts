import type { Server } from 'http';
import { createServer } from 'http';
import type { AddressInfo } from 'net';
import serveMiddleware from 'serve-handler';
import { webpack } from 'webpack';

import type { ProcessedConfig, ProcessedWebpackConfig } from '../config';
import type { WebpackOptions } from './config';
import { getDefaultConfiguration } from './config';

/**
 * Get a Webpack compiler for the given config.
 *
 * @param config - The config object.
 * @param options - The Webpack options.
 * @returns The Webpack compiler.
 */
export async function getCompiler(
  config: ProcessedWebpackConfig,
  options?: WebpackOptions,
) {
  const baseWebpackConfig = await getDefaultConfiguration(config, options);
  const webpackConfig =
    config.customizeWebpackConfig?.(baseWebpackConfig) ?? baseWebpackConfig;

  return webpack(webpackConfig);
}

/**
 * Get a static server for development purposes.
 *
 * Note: We're intentionally not using `webpack-dev-server` here because it
 * adds a lot of extra stuff to the output that we don't need, and it's
 * difficult to customize.
 *
 * @param config - The config object.
 * @returns An object with a `listen` method that returns a promise that
 * resolves when the server is listening.
 */
export function getServer(config: ProcessedConfig) {
  const server = createServer((request, response) => {
    serveMiddleware(request, response, {
      public: config.server.root,
      headers: [
        {
          source: '**/*',
          headers: [
            {
              key: 'Cache-Control',
              value: 'no-cache',
            },
            {
              key: 'Access-Control-Allow-Origin',
              value: '*',
            },
          ],
        },
      ],
    })?.catch(
      /* istanbul ignore next */ () => {
        response.statusCode = 500;
        response.end();
      },
    );
  });

  /**
   * Start the server on the port specified in the config.
   *
   * @param port - The port to listen on.
   * @returns A promise that resolves when the server is listening. The promise
   * resolves to an object with the port and the server instance. Note that if
   * the `config.server.port` is `0`, the OS will choose a random port for us,
   * so we need to get the port from the server after it starts.
   */
  const listen = async (port = config.server.port) => {
    return new Promise<{
      port: number;
      server: Server;
      close: () => Promise<void>;
    }>((resolve, reject) => {
      try {
        server.listen(port, () => {
          const close = async () => {
            await new Promise<void>((resolveClose, rejectClose) => {
              server.close((closeError) => {
                if (closeError) {
                  return rejectClose(closeError);
                }

                return resolveClose();
              });
            });
          };

          const address = server.address() as AddressInfo;
          resolve({ port: address.port, server, close });
        });
      } catch (listenError) {
        reject(listenError);
      }
    });
  };

  return { listen };
}

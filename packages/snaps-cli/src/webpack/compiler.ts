import express from 'express';
import { Server } from 'http';
import { AddressInfo } from 'net';
import { webpack } from 'webpack';

import { ProcessedConfig, ProcessedWebpackConfig } from '../config';
import { getDefaultConfiguration, WebpackOptions } from './config';

/**
 * Get a Webpack compiler for the given config.
 *
 * @param config - The config object.
 * @param options - The Webpack options.
 * @returns The Webpack compiler.
 */
export function getCompiler(
  config: ProcessedWebpackConfig,
  options?: WebpackOptions,
) {
  const baseWebpackConfig = getDefaultConfiguration(config, options);
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
  const app = express();

  app.use(
    // TODO: Get path from config (or manifest?).
    express.static(config.server.root, {
      dotfiles: 'deny',
      extensions: ['html', 'js', 'json', 'svg'],
      cacheControl: false,
      setHeaders: (response) => {
        // Add cache header to all responses, to prevent the browser from
        // caching the response.
        response.setHeader('Cache-Control', 'no-cache');

        // Add CORS header to all responses, to allow the browser to make
        // requests to the server.
        response.setHeader('Access-Control-Allow-Origin', '*');
      },
    }),
  );

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
    return new Promise<{ port: number; server: Server }>((resolve, reject) => {
      try {
        const server = app.listen(port, () => {
          const address = server.address() as AddressInfo;
          resolve({ port: address.port, server });
        });
      } catch (listenError) {
        reject(listenError);
      }
    });
  };

  return { listen };
}

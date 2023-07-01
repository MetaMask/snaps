import express from 'express';
import { Server } from 'http';
import { AddressInfo } from 'net';
import { webpack } from 'webpack';

import { ProcessedWebpackConfig } from '../config';
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
 * @returns An object with a `listen` method that returns a promise that
 * resolves when the server is listening.
 */
export function getServer() {
  const app = express();

  app.use(
    // TODO: Get path from config (or manifest?).
    express.static(process.cwd(), {
      dotfiles: 'deny',
      extensions: ['html', 'js', 'json', 'svg'],
    }),
  );

  /**
   * Start the server on the given port.
   *
   * @param port - The port to listen on.
   * @returns A promise that resolves when the server is listening.
   */
  const listen = async (port: number) => {
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

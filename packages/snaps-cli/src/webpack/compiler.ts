import express from 'express';
import { AddressInfo } from 'net';
import { webpack } from 'webpack';

import { ProcessedWebpackConfig } from '../config';
import { error, info } from '../utils';
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

  const compiler = webpack(webpackConfig);
  compiler.hooks.afterDone.tap('AfterCompilePlugin', (stats) => {
    if (!stats) {
      return;
    }

    const { modules, time, errors } = stats.toJson();
    if (!modules || !time) {
      error(
        'Compilation status unknown. Please check your config.',
        options?.spinner,
      );

      process.exitCode = 1;
      return;
    }

    if (errors?.length) {
      error(
        `Compiled ${modules?.length} files in ${time}ms with ${errors?.length} errors.`,
        options?.spinner,
      );

      process.exitCode = 1;
      return;
    }

    info(`Compiled ${modules?.length} files in ${time}ms.`, options?.spinner);
    options?.spinner?.succeed('Done!');
  });

  return compiler;
}

/**
 * Get a static server for development purposes.
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

  const listen = async (port: number) => {
    return new Promise<number>((resolve, reject) => {
      try {
        const server = app.listen(port, () => {
          const address = server.address() as AddressInfo;
          resolve(address.port);
        });
      } catch (listenError) {
        reject(listenError);
      }
    });
  };

  return { listen };
}

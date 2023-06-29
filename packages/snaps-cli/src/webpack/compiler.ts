import { logInfo } from '@metamask/snaps-utils';
import { resolve } from 'path';
import { webpack } from 'webpack';
import WebpackDevServer from 'webpack-dev-server';

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
  });

  return compiler;
}

/**
 * Get a Webpack dev server for the given config.
 *
 * @param config - The config object.
 * @param options - The Webpack options.
 * @returns The Webpack dev server.
 */
export function getServer(
  config: ProcessedWebpackConfig,
  options: WebpackOptions,
) {
  const compiler = getCompiler(config, options);

  return new WebpackDevServer(
    {
      port: config.server.port,
      static: {
        directory: resolve(process.cwd(), config.server.root),
        watch: options.watch,
        serveIndex: true,
      },

      devMiddleware: {
        writeToDisk: true,
      },

      magicHtml: false,
      hot: false,
      liveReload: false,

      client: {
        logging: 'error',
        overlay: false,
        progress: false,
        reconnect: false,
      },

      onListening: () => {
        logInfo(`Server listening on: http://localhost:${config.server.port}`);
      },
    },
    compiler,
  );
}

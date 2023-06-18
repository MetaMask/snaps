import { resolve } from 'path';
import WebpackDevServer from 'webpack-dev-server';

import type { ProcessedConfig } from '../../config';
import { getCompiler } from '../../utils';
import { legacyWatch } from './legacy';

/**
 * Watch a directory and its subdirectories for changes, and build when files
 * are added or changed.
 *
 * Ignores 'node_modules' and dotfiles.
 * Creates destination directory if it doesn't exist.
 *
 * @param config - The config object.
 */
export async function watch(config: ProcessedConfig): Promise<void> {
  if (config.bundler === 'browserify') {
    return await legacyWatch(config);
  }

  const compiler = getCompiler(config, {
    evaluate: false,
    watch: true,
  });

  const server = new WebpackDevServer(
    {
      port: config.server.port,
      static: {
        directory: resolve(process.cwd(), config.server.root),
        watch: true,
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
    },
    compiler,
  );

  return await server.start();
}

import { logInfo } from '@metamask/snaps-utils';
import { resolve } from 'path';
import WebpackDevServer from 'webpack-dev-server';

import { ProcessedConfig } from '../../config';
import { getCompiler } from '../../utils';
import { legacyServe } from './legacy';

/**
 * Starts a local, static HTTP server on the given port with the given root
 * directory.
 *
 * @param config - The config object.
 */
// eslint-disable-next-line consistent-return
export async function serve(config: ProcessedConfig): Promise<void> {
  if (config.bundler === 'browserify') {
    return await legacyServe(config);
  }

  const compiler = getCompiler(config, {
    watch: false,
    evaluate: false,
  });

  const server = new WebpackDevServer(
    {
      port: config.server.port,
      watchFiles: [],
      hot: false,
      liveReload: false,

      client: {
        logging: 'error',
        overlay: false,
      },

      static: {
        directory: resolve(process.cwd(), config.server.root),
      },
    },
    compiler,
  );

  await server.start();
  logInfo(`Server listening on: http://localhost:${config.server.port}`);
}

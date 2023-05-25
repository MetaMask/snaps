import * as console from 'console';
import express, { Express } from 'express';
import { webpack } from 'webpack';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';

import config from '../webpack.config';
import { routers } from './routes';

const MIN_PORT = 9000;
const MAX_PORT = 9999;

/**
 * Listen on a port.
 *
 * @param app - The Express application.
 * @param port - The port to listen on.
 * @returns A promise that resolves when the server is listening.
 */
export async function listen(app: Express, port: number) {
  return new Promise<void>((resolve, reject) => {
    const server = app.listen(port, () => {
      resolve();
    });

    server.on('error', reject);
  });
}

/**
 * Create an Express application.
 */
export async function main() {
  const app = express();
  const compiler = webpack(config);

  app.use(webpackDevMiddleware(compiler) as any);
  app.use(webpackHotMiddleware(compiler as any));

  app.use(express.json());

  routers.forEach((router) => app.use(router));

  const promises = new Array(MAX_PORT - MIN_PORT)
    .fill(0)
    .map(async (_, index) => {
      const port = MIN_PORT + index;
      await listen(app, port);
    });

  await Promise.all(promises);
  console.log(`Listening on ports ${MIN_PORT} to ${MAX_PORT}.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

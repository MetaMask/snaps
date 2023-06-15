import {
  assertIsSnapManifest,
  isDirectory,
  isFile,
  SnapManifest,
} from '@metamask/snaps-utils';
import { createModuleLogger } from '@metamask/utils';
import express from 'express';
import { promises as fs } from 'fs';
import { createServer, Server } from 'http';
import { resolve as pathResolve, dirname } from 'path';

import { SnapsEnvironmentOptions } from '../options';
import { rootLogger } from './logger';

const SNAPS_EXECUTION_ENVIRONMENTS_PATH = pathResolve(
  dirname(
    require.resolve('@metamask/snaps-execution-environments/package.json'),
  ),
  'dist',
  'browserify',
  'iframe',
);

const SNAPS_SIMULATOR_PATH = pathResolve(
  dirname(require.resolve('@metamask/snaps-simulator/package.json')),
  'dist',
  'webpack',
  'test',
);

export type ServerOptions = Required<
  // We need a double `Required` for the type to be inferred correctly.
  Required<SnapsEnvironmentOptions>['server']
>;

/**
 * Check that:
 *
 * - The root directory exists.
 * - The root directory contains a `snap.manifest.json` file.
 * - The file path in the manifest exists.
 *
 * @param root - The root directory.
 * @throws If any of the checks fail.
 */
async function assertRoot(root: string) {
  if (!root) {
    throw new Error('You must specify a root directory.');
  }

  if (!(await isDirectory(root, false))) {
    throw new Error(`Root directory "${root}" is not a directory.`);
  }

  const manifestPath = pathResolve(root, 'snap.manifest.json');
  const manifest: SnapManifest = await fs
    .readFile(manifestPath, 'utf8')
    .then(JSON.parse);

  assertIsSnapManifest(manifest);
  const filePath = pathResolve(root, manifest.source.location.npm.filePath);

  if (!(await isFile(filePath))) {
    throw new Error(
      `File "${filePath}" does not exist, or is not a file. Did you forget to build your snap?`,
    );
  }
}

/**
 * Start an HTTP server on `localhost` with a random port. This is used to serve
 * the static files for the environment.
 *
 * @param options - The options to use.
 * @param options.port - The port to use for the server.
 * @param options.root - The root directory to serve from the server.
 * @returns The HTTP server.
 */
export async function startServer(options: ServerOptions) {
  await assertRoot(options.root);

  const log = createModuleLogger(rootLogger, 'server');
  const app = express();

  app.use('/environment', express.static(SNAPS_EXECUTION_ENVIRONMENTS_PATH));
  app.use('/simulator', express.static(SNAPS_SIMULATOR_PATH));
  app.use(express.static(pathResolve(process.cwd(), options.root)));

  const server = createServer(app);
  return await new Promise<Server>((resolve, reject) => {
    server.listen(options.port, () => {
      resolve(server);
    });

    server.on('error', (error) => {
      log(error);
      reject(error);
    });
  });
}

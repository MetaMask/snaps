import type { SnapManifest } from '@metamask/snaps-utils';
import { NpmSnapFileNames, readJsonFile } from '@metamask/snaps-utils/node';
import type { Express, Request } from 'express';
import express, { static as expressStatic } from 'express';
import type { Server } from 'http';
import type { AddressInfo } from 'net';
import { join, relative, resolve as resolvePath, sep, posix } from 'path';

import type { ProcessedConfig } from '../config';

/**
 * Options for the {@link getServer} function.
 */
type ServerOptions = {
  /**
   * The path to the manifest file to serve as `/snap.manifest.json`.
   */
  manifestPath?: string;
};

/**
 * Get the relative path from one path to another.
 *
 * Note: This is a modified version of `path.relative` that uses Posix
 * separators for URL-compatibility.
 *
 * @param from - The path to start from.
 * @param to - The path to end at.
 * @returns The relative path.
 */
function getRelativePath(from: string, to: string) {
  return relative(from, to).split(sep).join(posix.sep);
}

/**
 * Get the allowed paths for the static server. This includes the output file,
 * the manifest file, and any auxiliary/localization files.
 *
 * @param config - The config object.
 * @param manifest - The Snap manifest object.
 * @returns An array of allowed paths.
 */
export function getAllowedPaths(
  config: ProcessedConfig,
  manifest: SnapManifest,
) {
  const auxiliaryFiles =
    manifest.source.files?.map((file) =>
      getRelativePath(
        config.server.root,
        resolvePath(config.server.root, file),
      ),
    ) ?? [];

  const localizationFiles =
    manifest.source.locales?.map((localization) =>
      getRelativePath(
        config.server.root,
        resolvePath(config.server.root, localization),
      ),
    ) ?? [];

  const otherFiles = manifest.source.location.npm.iconPath
    ? [
        getRelativePath(
          config.server.root,
          resolvePath(
            config.server.root,
            manifest.source.location.npm.iconPath,
          ),
        ),
      ]
    : [];

  return [
    getRelativePath(
      config.server.root,
      resolvePath(
        config.server.root,
        config.output.path,
        config.output.filename,
      ),
    ),
    getRelativePath(
      config.server.root,
      resolvePath(config.server.root, NpmSnapFileNames.Manifest),
    ),
    ...auxiliaryFiles,
    ...localizationFiles,
    ...otherFiles,
  ];
}

/**
 * Get whether the request path is allowed. This is used to check if the request
 * path is in the list of allowed paths for the static server.
 *
 * @param request - The request object.
 * @param config - The config object.
 * @param options - The server options.
 * @param options.manifestPath - The path to the manifest file to serve as
 * `/snap.manifest.json`.
 * @returns A promise that resolves to `true` if the path is allowed, or
 * `false` if it is not.
 */
async function isAllowedPath(
  request: Request,
  config: ProcessedConfig,
  options: ServerOptions,
) {
  const { manifestPath = join(config.server.root, NpmSnapFileNames.Manifest) } =
    options;

  const { result } = await readJsonFile<SnapManifest>(manifestPath);
  const allowedPaths = getAllowedPaths(config, result);

  const path = request.path.slice(1);
  return allowedPaths.some((allowedPath) => path === allowedPath);
}

type Middleware = (app: Express) => void;

/**
 * Get a static server for development purposes.
 *
 * Note: We're intentionally not using `webpack-dev-server` here because it
 * adds a lot of extra stuff to the output that we don't need, and it's
 * difficult to customize.
 *
 * @param config - The config object.
 * @param options - The server options.
 * @param options.manifestPath - The path to the manifest file to serve as
 * `/snap.manifest.json`.
 * @param middleware - An array of middleware functions to run before serving
 * the static files.
 * @returns An object with a `listen` method that returns a promise that
 * resolves when the server is listening.
 */
export function getServer(
  config: ProcessedConfig,
  options: ServerOptions = {},
  middleware: Middleware[] = [],
) {
  const { manifestPath = join(config.server.root, NpmSnapFileNames.Manifest) } =
    options;

  const app = express();

  // Run "middleware" functions before serving the static files.
  middleware.forEach((fn) => fn(app));

  // Check for allowed paths in the request URL.
  app.use((request, response, next) => {
    isAllowedPath(request, config, options)
      .then((allowed) => {
        if (allowed) {
          // eslint-disable-next-line promise/no-callback-in-promise
          next();
          return;
        }

        response.status(404);
        response.end();
      })
      // eslint-disable-next-line promise/no-callback-in-promise
      .catch(next);
  });

  app.get('/snap.manifest.json', (_request, response, next) => {
    response.sendFile(manifestPath, (error) => {
      if (error) {
        next(error);
      }
    });
  });

  // Serve the static files.
  app.use(
    expressStatic(config.server.root, {
      dotfiles: 'deny',
      setHeaders: (res) => {
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Access-Control-Allow-Origin', '*');
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
    return new Promise<{
      port: number;
      server: Server;
      close: () => Promise<void>;
    }>((resolve, reject) => {
      // eslint-disable-next-line consistent-return
      const server = app.listen(port, (error) => {
        if (error) {
          return reject(error);
        }

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
    });
  };

  return { listen };
}

import type { SnapManifest } from '@metamask/snaps-utils';
import { NpmSnapFileNames, readJsonFile } from '@metamask/snaps-utils';
import type { Server } from 'http';
import { createServer } from 'http';
import type { AddressInfo } from 'net';
import { join, relative, resolve as resolvePath } from 'path';
import serveMiddleware from 'serve-handler';

import type { ProcessedConfig } from '../config';

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
      relative(config.server.root, resolvePath(config.server.root, file)),
    ) ?? [];

  const localizationFiles =
    manifest.source.locales?.map((localization) =>
      relative(
        config.server.root,
        resolvePath(config.server.root, localization),
      ),
    ) ?? [];

  return [
    relative(
      config.server.root,
      resolvePath(
        config.server.root,
        config.output.path,
        config.output.filename,
      ),
    ),
    relative(
      config.server.root,
      resolvePath(config.server.root, NpmSnapFileNames.Manifest),
    ),
    ...auxiliaryFiles,
    ...localizationFiles,
  ];
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
export async function getServer(config: ProcessedConfig) {
  const manifestPath = join(config.server.root, NpmSnapFileNames.Manifest);
  const { result } = await readJsonFile<SnapManifest>(manifestPath);
  const allowedPaths = getAllowedPaths(config, result);

  const server = createServer((request, response) => {
    const path = request.url?.slice(1);
    const allowed = allowedPaths.some((allowedPath) => path === allowedPath);

    if (!allowed) {
      response.statusCode = 404;
      response.end();
      return;
    }

    serveMiddleware(request, response, {
      public: config.server.root,
      directoryListing: false,
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

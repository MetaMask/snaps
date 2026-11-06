import type { SnapId } from '@metamask/snaps-sdk';
import type {
  LocalizationFile,
  SnapManifest,
  VirtualFile,
} from '@metamask/snaps-utils';
import {
  DEFAULT_SNAP_BUNDLE,
  getMockSnapFilesWithUpdatedChecksum,
  getSnapManifest,
} from '@metamask/snaps-utils/test-utils';
import type { Application } from 'express';
import express from 'express';
import type { Server } from 'http';
import type { AddressInfo } from 'net';

export type MockServerOptions = {
  /**
   * The source code to serve. This is assumed to be a string of JavaScript
   * code.
   */
  sourceCode?: string;

  /**
   * The snap manifest to serve. Defaults to the result of calling
   * {@link getSnapManifest}. This can be used to serve a modified manifest.
   *
   * The checksum in the manifest will be updated to match the source code.
   */
  manifest?: SnapManifest;

  /**
   * The port to listen on. Defaults to `0`, which means that the OS will
   * choose a random available port.
   */
  port?: number;

  /**
   * Auxiliary files to serve.
   */
  auxiliaryFiles?: VirtualFile[];

  /**
   * Localization files to serve.
   */
  localizationFiles?: {
    path: string;
    file: LocalizationFile;
  }[];
};

/**
 * Get a mock server that serves the given source code, and manifest.
 *
 * The server will listen on a random available port. The returned object
 * contains the Snap ID of the server, as well as a `close` method that can be
 * used to close the server.
 *
 * @param options - The options to use.
 * @param options.sourceCode - The source code to serve. This is assumed to be a
 * string of JavaScript code.
 * @param options.manifest - The snap manifest to serve. Defaults to the result
 * of calling {@link getSnapManifest}. This can be used to serve a modified
 * manifest.
 * @param options.port - The port to listen on. Defaults to `0`, which means
 * that the OS will choose a random available port.
 * @param options.auxiliaryFiles - Auxiliary files to serve.
 * @param options.localizationFiles - Localization files to serve.
 * @returns The mock server.
 */
export async function getMockServer({
  sourceCode = DEFAULT_SNAP_BUNDLE,
  manifest = getSnapManifest({
    initialPermissions: {},
  }),
  auxiliaryFiles = [],
  localizationFiles = [],
  port = 0,
}: MockServerOptions = {}) {
  const snapFiles = await getMockSnapFilesWithUpdatedChecksum({
    manifest,
    sourceCode,
    auxiliaryFiles,
    localizationFiles: localizationFiles.map(({ file }) => file),
  });

  const app = express();
  app.use('/snap.manifest.json', (_, response) => {
    response.end(snapFiles.manifest.value);
  });

  app.use('/package.json', (_, response) => {
    response.end(snapFiles.packageJson.value);
  });

  app.use(
    `/${snapFiles.manifest.result.source.location.npm.filePath}`,
    (_, response) => {
      response.end(snapFiles.sourceCode.value);
    },
  );

  const icon = snapFiles.svgIcon;
  if (icon) {
    app.use(
      `/${snapFiles.manifest.result.source.location.npm.iconPath}`,
      (_, response) => {
        response.end(icon.value);
      },
    );
  }

  auxiliaryFiles?.forEach((file) => {
    app.use(`/${file.path}`, (_, response) => {
      response.end(file.value.toString());
    });
  });

  localizationFiles?.forEach(({ file, path }) => {
    app.use(`/${path}`, (_, response) => {
      response.end(JSON.stringify(file));
    });
  });

  const server = await listen(app, port);
  const address = server.address() as AddressInfo;
  const snapId = `local:http://localhost:${address.port}` as SnapId;

  return {
    snapId,
    close: async () => close(server),
  };
}

/**
 * Listen on the given port. This function is a wrapper around `app.listen`, but
 * it returns a promise rather than accepting a callback.
 *
 * @param app - The Express app to listen on.
 * @param port - The port to listen on.
 * @returns A promise that resolves to the server.
 */
async function listen(app: Application, port: number) {
  return new Promise<Server>((resolve) => {
    const server = app.listen(port, () => {
      resolve(server);
    });
  });
}

/**
 * Close the given server. This function is a wrapper around `server.close`, but
 * it returns a promise rather than accepting a callback.
 *
 * @param server - The server to close.
 * @returns A promise that resolves when the server is closed.
 */
async function close(server: Server) {
  return new Promise<void>((resolve) => {
    server.close(() => {
      resolve();
    });
  });
}

// src/webpack/server.ts
import {
  logError,
  NpmSnapFileNames,
  readJsonFile
} from "@metamask/snaps-utils/node";
import { createServer } from "http";
import { join, relative, resolve as resolvePath, sep, posix } from "path";
import serveMiddleware from "serve-handler";
function getRelativePath(from, to) {
  return relative(from, to).split(sep).join(posix.sep);
}
function getAllowedPaths(config, manifest) {
  const auxiliaryFiles = manifest.source.files?.map(
    (file) => getRelativePath(
      config.server.root,
      resolvePath(config.server.root, file)
    )
  ) ?? [];
  const localizationFiles = manifest.source.locales?.map(
    (localization) => getRelativePath(
      config.server.root,
      resolvePath(config.server.root, localization)
    )
  ) ?? [];
  const otherFiles = manifest.source.location.npm.iconPath ? [
    getRelativePath(
      config.server.root,
      resolvePath(
        config.server.root,
        manifest.source.location.npm.iconPath
      )
    )
  ] : [];
  return [
    getRelativePath(
      config.server.root,
      resolvePath(
        config.server.root,
        config.output.path,
        config.output.filename
      )
    ),
    getRelativePath(
      config.server.root,
      resolvePath(config.server.root, NpmSnapFileNames.Manifest)
    ),
    ...auxiliaryFiles,
    ...localizationFiles,
    ...otherFiles
  ];
}
function getServer(config) {
  async function getResponse(request, response) {
    const manifestPath = join(config.server.root, NpmSnapFileNames.Manifest);
    const { result } = await readJsonFile(manifestPath);
    const allowedPaths = getAllowedPaths(config, result);
    const path = request.url?.slice(1);
    const allowed = allowedPaths.some((allowedPath) => path === allowedPath);
    if (!allowed) {
      response.statusCode = 404;
      response.end();
      return;
    }
    await serveMiddleware(request, response, {
      public: config.server.root,
      directoryListing: false,
      headers: [
        {
          source: "**/*",
          headers: [
            {
              key: "Cache-Control",
              value: "no-cache"
            },
            {
              key: "Access-Control-Allow-Origin",
              value: "*"
            }
          ]
        }
      ]
    });
  }
  const server = createServer((request, response) => {
    getResponse(request, response).catch(
      /* istanbul ignore next */
      (error) => {
        logError(error);
        response.statusCode = 500;
        response.end();
      }
    );
  });
  const listen = async (port = config.server.port) => {
    return new Promise((resolve, reject) => {
      try {
        server.listen(port, () => {
          const close = async () => {
            await new Promise((resolveClose, rejectClose) => {
              server.close((closeError) => {
                if (closeError) {
                  return rejectClose(closeError);
                }
                return resolveClose();
              });
            });
          };
          const address = server.address();
          resolve({ port: address.port, server, close });
        });
      } catch (listenError) {
        reject(listenError);
      }
    });
  };
  return { listen };
}

export {
  getAllowedPaths,
  getServer
};
//# sourceMappingURL=chunk-SYRWT2KT.mjs.map
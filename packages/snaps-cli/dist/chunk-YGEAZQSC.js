"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }// src/webpack/server.ts




var _node = require('@metamask/snaps-utils/node');
var _http = require('http');
var _path = require('path');
var _servehandler = require('serve-handler'); var _servehandler2 = _interopRequireDefault(_servehandler);
function getRelativePath(from, to) {
  return _path.relative.call(void 0, from, to).split(_path.sep).join(_path.posix.sep);
}
function getAllowedPaths(config, manifest) {
  const auxiliaryFiles = manifest.source.files?.map(
    (file) => getRelativePath(
      config.server.root,
      _path.resolve.call(void 0, config.server.root, file)
    )
  ) ?? [];
  const localizationFiles = manifest.source.locales?.map(
    (localization) => getRelativePath(
      config.server.root,
      _path.resolve.call(void 0, config.server.root, localization)
    )
  ) ?? [];
  const otherFiles = manifest.source.location.npm.iconPath ? [
    getRelativePath(
      config.server.root,
      _path.resolve.call(void 0, 
        config.server.root,
        manifest.source.location.npm.iconPath
      )
    )
  ] : [];
  return [
    getRelativePath(
      config.server.root,
      _path.resolve.call(void 0, 
        config.server.root,
        config.output.path,
        config.output.filename
      )
    ),
    getRelativePath(
      config.server.root,
      _path.resolve.call(void 0, config.server.root, _node.NpmSnapFileNames.Manifest)
    ),
    ...auxiliaryFiles,
    ...localizationFiles,
    ...otherFiles
  ];
}
function getServer(config) {
  async function getResponse(request, response) {
    const manifestPath = _path.join.call(void 0, config.server.root, _node.NpmSnapFileNames.Manifest);
    const { result } = await _node.readJsonFile.call(void 0, manifestPath);
    const allowedPaths = getAllowedPaths(config, result);
    const path = request.url?.slice(1);
    const allowed = allowedPaths.some((allowedPath) => path === allowedPath);
    if (!allowed) {
      response.statusCode = 404;
      response.end();
      return;
    }
    await _servehandler2.default.call(void 0, request, response, {
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
  const server = _http.createServer.call(void 0, (request, response) => {
    getResponse(request, response).catch(
      /* istanbul ignore next */
      (error) => {
        _node.logError.call(void 0, error);
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




exports.getAllowedPaths = getAllowedPaths; exports.getServer = getServer;
//# sourceMappingURL=chunk-YGEAZQSC.js.map
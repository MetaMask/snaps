"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _chunkTZB4LBT7js = require('./chunk-TZB4LBT7.js');

// src/internals/server.ts




var _node = require('@metamask/snaps-utils/node');
var _utils = require('@metamask/utils');
var _express = require('express'); var _express2 = _interopRequireDefault(_express);
var _fs = require('fs');
var _http = require('http');
var _path = require('path');
async function assertRoot(root) {
  if (!root) {
    throw new Error("You must specify a root directory.");
  }
  if (!await _node.isDirectory.call(void 0, root, false)) {
    throw new Error(`Root directory "${root}" is not a directory.`);
  }
  const manifestPath = _path.resolve.call(void 0, root, "snap.manifest.json");
  const manifest = await _fs.promises.readFile(manifestPath, "utf8").then(JSON.parse);
  _node.assertIsSnapManifest.call(void 0, manifest);
  const filePath = _path.resolve.call(void 0, root, manifest.source.location.npm.filePath);
  if (!await _node.isFile.call(void 0, filePath)) {
    throw new Error(
      `File "${filePath}" does not exist, or is not a file. Did you forget to build your snap?`
    );
  }
}
async function startServer(options) {
  await assertRoot(options.root);
  const log = _utils.createModuleLogger.call(void 0, _chunkTZB4LBT7js.rootLogger, "server");
  const app = _express2.default.call(void 0, );
  app.use((_request, response, next) => {
    response.header("Access-Control-Allow-Origin", "*");
    response.header("Access-Control-Allow-Credentials", "true");
    response.header("Access-Control-Allow-Methods", "GET, OPTIONS");
    response.header("Access-Control-Allow-Headers", "Content-Type");
    next();
  });
  app.use(_express2.default.static(_path.resolve.call(void 0, process.cwd(), options.root)));
  const server = _http.createServer.call(void 0, app);
  return await new Promise((resolve, reject) => {
    server.listen(options.port, () => {
      resolve(server);
    });
    server.on("error", (error) => {
      log(error);
      reject(error);
    });
  });
}



exports.startServer = startServer;
//# sourceMappingURL=chunk-N6MAO223.js.map
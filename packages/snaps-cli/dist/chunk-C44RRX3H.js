"use strict";Object.defineProperty(exports, "__esModule", {value: true});

var _chunkYGEAZQSCjs = require('./chunk-YGEAZQSC.js');


var _chunkTJ2F3J6Xjs = require('./chunk-TJ2F3J6X.js');

// src/commands/serve/serve.ts
async function serveHandler(config, options) {
  const server = _chunkYGEAZQSCjs.getServer.call(void 0, config);
  const { port } = await server.listen(options.port);
  _chunkTJ2F3J6Xjs.info.call(void 0, `The server is listening on http://localhost:${port}.`);
}



exports.serveHandler = serveHandler;
//# sourceMappingURL=chunk-C44RRX3H.js.map
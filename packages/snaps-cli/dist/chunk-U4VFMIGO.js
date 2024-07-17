"use strict";Object.defineProperty(exports, "__esModule", {value: true});

var _chunkC44RRX3Hjs = require('./chunk-C44RRX3H.js');


var _chunkS7UP2YYFjs = require('./chunk-S7UP2YYF.js');

// src/commands/serve/index.ts
var command = {
  command: ["serve", "s"],
  desc: "Locally serve Snap file(s) for testing",
  builder: (yarg) => {
    yarg.option("root", _chunkS7UP2YYFjs.builders_default.root).option("port", _chunkS7UP2YYFjs.builders_default.port);
  },
  handler: async (argv) => _chunkC44RRX3Hjs.serveHandler.call(void 0, argv.context.config, {
    port: argv.port ?? argv.context.config.server.port
  })
};
var serve_default = command;



exports.serve_default = serve_default;
//# sourceMappingURL=chunk-U4VFMIGO.js.map
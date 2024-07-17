"use strict";Object.defineProperty(exports, "__esModule", {value: true});

var _chunkHLQEI6DVjs = require('./chunk-HLQEI6DV.js');


var _chunkS7UP2YYFjs = require('./chunk-S7UP2YYF.js');

// src/commands/watch/index.ts
var command = {
  command: ["watch", "w"],
  desc: "Build Snap on change",
  builder: (yarg) => {
    yarg.option("src", _chunkS7UP2YYFjs.builders_default.src).option("eval", _chunkS7UP2YYFjs.builders_default.eval).option("dist", _chunkS7UP2YYFjs.builders_default.dist).option("outfileName", _chunkS7UP2YYFjs.builders_default.outfileName).option("sourceMaps", _chunkS7UP2YYFjs.builders_default.sourceMaps).option("stripComments", _chunkS7UP2YYFjs.builders_default.stripComments).option("transpilationMode", _chunkS7UP2YYFjs.builders_default.transpilationMode).option("depsToTranspile", _chunkS7UP2YYFjs.builders_default.depsToTranspile).option("manifest", _chunkS7UP2YYFjs.builders_default.manifest).option("writeManifest", _chunkS7UP2YYFjs.builders_default.writeManifest).option("serve", _chunkS7UP2YYFjs.builders_default.serve).option("root", _chunkS7UP2YYFjs.builders_default.root).option("port", _chunkS7UP2YYFjs.builders_default.port).implies("writeManifest", "manifest").implies("depsToTranspile", "transpilationMode");
  },
  handler: async (argv) => _chunkHLQEI6DVjs.watchHandler.call(void 0, argv.context.config, {
    port: argv.port
  })
};
var watch_default = command;



exports.watch_default = watch_default;
//# sourceMappingURL=chunk-RANTKN66.js.map
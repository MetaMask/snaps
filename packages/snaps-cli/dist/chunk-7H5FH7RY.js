"use strict";Object.defineProperty(exports, "__esModule", {value: true});

var _chunk4JEJ7WKRjs = require('./chunk-4JEJ7WKR.js');


var _chunkS7UP2YYFjs = require('./chunk-S7UP2YYF.js');

// src/commands/build/index.ts
var command = {
  command: ["build", "b"],
  desc: "Build snap from source",
  builder: (yarg) => {
    yarg.option("dist", _chunkS7UP2YYFjs.builders_default.dist).option("eval", _chunkS7UP2YYFjs.builders_default.eval).option("manifest", _chunkS7UP2YYFjs.builders_default.manifest).option("outfileName", _chunkS7UP2YYFjs.builders_default.outfileName).option("sourceMaps", _chunkS7UP2YYFjs.builders_default.sourceMaps).option("src", _chunkS7UP2YYFjs.builders_default.src).option("stripComments", _chunkS7UP2YYFjs.builders_default.stripComments).option("transpilationMode", _chunkS7UP2YYFjs.builders_default.transpilationMode).option("depsToTranspile", _chunkS7UP2YYFjs.builders_default.depsToTranspile).option("writeManifest", _chunkS7UP2YYFjs.builders_default.writeManifest).implies("writeManifest", "manifest").implies("depsToTranspile", "transpilationMode");
  },
  handler: async (argv) => _chunk4JEJ7WKRjs.buildHandler.call(void 0, argv.context.config)
};
var build_default = command;



exports.build_default = build_default;
//# sourceMappingURL=chunk-7H5FH7RY.js.map
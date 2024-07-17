"use strict";Object.defineProperty(exports, "__esModule", {value: true});

var _chunkQFK7JVP3js = require('./chunk-QFK7JVP3.js');


var _chunkS7UP2YYFjs = require('./chunk-S7UP2YYF.js');

// src/commands/manifest/index.ts
var command = {
  command: ["manifest", "m"],
  desc: "Validate the snap.manifest.json file",
  builder: (yarg) => {
    yarg.option("writeManifest", _chunkS7UP2YYFjs.builders_default.writeManifest);
    yarg.option("fix", _chunkS7UP2YYFjs.builders_default.fix);
  },
  handler: async (argv) => _chunkQFK7JVP3js.manifestHandler.call(void 0, argv.context.config, { fix: argv.fix })
};
var manifest_default = command;



exports.manifest_default = manifest_default;
//# sourceMappingURL=chunk-S76EZ6HY.js.map
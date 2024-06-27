"use strict";Object.defineProperty(exports, "__esModule", {value: true});

var _chunkWP2N4NCOjs = require('./chunk-WP2N4NCO.js');


var _chunkXGWLFH7Yjs = require('./chunk-XGWLFH7Y.js');


var _chunkBALQOCUOjs = require('./chunk-BALQOCUO.js');

// src/commands/manifest/manifest.ts
var _node = require('@metamask/snaps-utils/node');
var steps = [
  {
    name: "Checking the input file.",
    task: async ({ input }) => {
      if (!await _node.isFile.call(void 0, input)) {
        throw new (0, _chunkBALQOCUOjs.CommandError)(
          `Manifest file not found: "${input}". Make sure that the \`snap.manifest.json\` file exists.`
        );
      }
    }
  },
  {
    name: "Validating the snap manifest.",
    task: async ({ input, config, options, spinner }) => {
      const write = getWriteManifest(config, options);
      const valid = await _chunkWP2N4NCOjs.manifest.call(void 0, input, write, spinner);
      if (valid) {
        spinner.succeed("The snap manifest file is valid.");
      }
    }
  }
];
function getWriteManifest(config, options) {
  if (typeof options.fix === "boolean") {
    return options.fix;
  }
  return config.legacy?.writeManifest ?? false;
}
async function manifestHandler(config, options) {
  await _chunkXGWLFH7Yjs.executeSteps.call(void 0, steps, {
    input: config.manifest.path,
    config,
    options
  });
}



exports.manifestHandler = manifestHandler;
//# sourceMappingURL=chunk-QFK7JVP3.js.map
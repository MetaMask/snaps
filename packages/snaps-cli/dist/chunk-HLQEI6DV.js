"use strict";Object.defineProperty(exports, "__esModule", {value: true});

var _chunkMECBOP7Gjs = require('./chunk-MECBOP7G.js');


var _chunkYGEAZQSCjs = require('./chunk-YGEAZQSC.js');


var _chunkXGWLFH7Yjs = require('./chunk-XGWLFH7Y.js');


var _chunkTJ2F3J6Xjs = require('./chunk-TJ2F3J6X.js');


var _chunkBALQOCUOjs = require('./chunk-BALQOCUO.js');

// src/commands/watch/watch.ts
var _node = require('@metamask/snaps-utils/node');
var steps = [
  {
    name: "Checking the input file.",
    task: async ({ config }) => {
      const { input } = config;
      if (!await _node.isFile.call(void 0, input)) {
        throw new (0, _chunkBALQOCUOjs.CommandError)(
          `Input file not found: "${input}". Make sure that the "input" field in your snap config is correct.`
        );
      }
    }
  },
  {
    name: "Starting the development server.",
    condition: ({ config }) => config.server.enabled,
    task: async ({ config, options, spinner }) => {
      const server = _chunkYGEAZQSCjs.getServer.call(void 0, config);
      const { port } = await server.listen(options.port ?? config.server.port);
      _chunkTJ2F3J6Xjs.info.call(void 0, `The server is listening on http://localhost:${port}.`, spinner);
    }
  },
  {
    name: "Building the snap bundle.",
    task: async ({ config, spinner }) => {
      await _chunkMECBOP7Gjs.watch.call(void 0, config, { spinner });
    }
  }
];
async function watchHandler(config, options) {
  await _chunkXGWLFH7Yjs.executeSteps.call(void 0, steps, { config, options });
}



exports.watchHandler = watchHandler;
//# sourceMappingURL=chunk-HLQEI6DV.js.map
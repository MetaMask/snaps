"use strict";Object.defineProperty(exports, "__esModule", {value: true});

var _chunk2ZBAKBVWjs = require('./chunk-2ZBAKBVW.js');


var _chunkMUYXNIONjs = require('./chunk-MUYXNION.js');


var _chunkXGWLFH7Yjs = require('./chunk-XGWLFH7Y.js');


var _chunkTJ2F3J6Xjs = require('./chunk-TJ2F3J6X.js');


var _chunkBALQOCUOjs = require('./chunk-BALQOCUO.js');

// src/commands/build/build.ts
var _node = require('@metamask/snaps-utils/node');
var _path = require('path');
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
    name: "Building the snap bundle.",
    task: async ({ config, spinner }) => {
      return await _chunk2ZBAKBVWjs.build.call(void 0, config, { evaluate: false, spinner });
    }
  },
  {
    name: "Evaluating the snap bundle.",
    condition: ({ config }) => config.evaluate,
    task: async ({ config, spinner }) => {
      const path = _path.resolve.call(void 0, 
        process.cwd(),
        config.output.path,
        config.output.filename
      );
      await _chunkMUYXNIONjs.evaluate.call(void 0, path);
      _chunkTJ2F3J6Xjs.info.call(void 0, `Snap bundle evaluated successfully.`, spinner);
    }
  }
];
async function buildHandler(config) {
  return await _chunkXGWLFH7Yjs.executeSteps.call(void 0, steps, {
    config
  });
}



exports.buildHandler = buildHandler;
//# sourceMappingURL=chunk-4JEJ7WKR.js.map
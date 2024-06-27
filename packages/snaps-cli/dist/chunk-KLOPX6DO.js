"use strict";Object.defineProperty(exports, "__esModule", {value: true});

var _chunkMUYXNIONjs = require('./chunk-MUYXNION.js');


var _chunkDBLADLQ4js = require('./chunk-DBLADLQ4.js');


var _chunkXGWLFH7Yjs = require('./chunk-XGWLFH7Y.js');


var _chunkBALQOCUOjs = require('./chunk-BALQOCUO.js');

// src/commands/eval/eval.ts
var _node = require('@metamask/snaps-utils/node');
var _path = require('path');
var steps = [
  {
    name: "Checking the input file.",
    task: async ({ input }) => {
      if (!await _node.isFile.call(void 0, input)) {
        const relativePath = _chunkDBLADLQ4js.getRelativePath.call(void 0, input);
        throw new (0, _chunkBALQOCUOjs.CommandError)(
          `Input file not found: "${relativePath}". Make sure that the "input" field in your snap config or the specified input file is correct.`
        );
      }
    }
  },
  {
    name: "Evaluating the snap bundle.",
    task: async ({ input, spinner }) => {
      await _chunkMUYXNIONjs.evaluate.call(void 0, input);
      spinner.succeed("Snap bundle evaluated successfully.");
    }
  }
];
function getBundlePath(config, options) {
  if (options.input) {
    return _path.resolve.call(void 0, process.cwd(), options.input);
  }
  return _path.resolve.call(void 0, config.output.path, config.output.filename);
}
async function evaluateHandler(config, options = {}) {
  const input = getBundlePath(config, options);
  await _chunkXGWLFH7Yjs.executeSteps.call(void 0, steps, { input });
}



exports.evaluateHandler = evaluateHandler;
//# sourceMappingURL=chunk-KLOPX6DO.js.map
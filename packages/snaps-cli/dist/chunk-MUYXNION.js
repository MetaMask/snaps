"use strict";Object.defineProperty(exports, "__esModule", {value: true});

var _chunkBALQOCUOjs = require('./chunk-BALQOCUO.js');

// src/commands/eval/implementation.ts
var _node = require('@metamask/snaps-utils/node');
var _chalk = require('chalk');
async function evaluate(path) {
  try {
    return await _node.evalBundle.call(void 0, path);
  } catch (evalError) {
    if (evalError instanceof _node.SnapEvalError) {
      throw new (0, _chunkBALQOCUOjs.CommandError)(
        `Failed to evaluate snap bundle in SES. This is likely due to an incompatibility with the SES environment in your snap.
Received the following error from the SES environment:

${_node.indent.call(void 0, 
          _chalk.red.call(void 0, evalError.output.stderr),
          2
        )}`
      );
    }
    throw evalError;
  }
}



exports.evaluate = evaluate;
//# sourceMappingURL=chunk-MUYXNION.js.map
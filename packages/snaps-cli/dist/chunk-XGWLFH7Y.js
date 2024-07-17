"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _chunkB3NNVTA6js = require('./chunk-B3NNVTA6.js');


var _chunkTJ2F3J6Xjs = require('./chunk-TJ2F3J6X.js');

// src/utils/steps.ts
var _chalk = require('chalk');
var _ora = require('ora'); var _ora2 = _interopRequireDefault(_ora);
async function executeSteps(steps, context) {
  const spinner = _ora2.default.call(void 0, {
    // Ora writes to `process.stderr` by default.
    stream: process.stdout
  });
  spinner.start();
  try {
    for (const step of steps) {
      if (step.condition && !step.condition(context)) {
        continue;
      }
      spinner.start(_chalk.dim.call(void 0, step.name));
      await step.task({
        ...context,
        spinner
      });
    }
    if (spinner.isSpinning) {
      spinner.succeed("Done!");
    }
  } catch (_error) {
    _chunkTJ2F3J6Xjs.error.call(void 0, _chunkB3NNVTA6js.getErrorMessage.call(void 0, _error), spinner);
    spinner.stop();
    process.exitCode = 1;
  }
}



exports.executeSteps = executeSteps;
//# sourceMappingURL=chunk-XGWLFH7Y.js.map
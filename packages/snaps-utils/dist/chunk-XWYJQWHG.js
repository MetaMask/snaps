"use strict";Object.defineProperty(exports, "__esModule", {value: true});

var _chunk6HXIPMBNjs = require('./chunk-6HXIPMBN.js');

// src/eval.ts
var _utils = require('@metamask/utils');
var _child_process = require('child_process');
var _path = require('path');
var SnapEvalError = class extends Error {
  constructor(message, output) {
    super(message);
    this.name = "SnapEvalError";
    this.output = output;
  }
};
async function evalBundle(bundlePath) {
  await _chunk6HXIPMBNjs.validateFilePath.call(void 0, bundlePath);
  return new Promise((resolve, reject) => {
    const worker = _child_process.fork.call(void 0, _path.join.call(void 0, __dirname, "eval-worker.js"), [bundlePath], {
      // To avoid printing the output of the worker to the console, we set
      // `stdio` to `pipe` and handle the output ourselves.
      stdio: "pipe"
    });
    let stdout = "";
    let stderr = "";
    _utils.assert.call(void 0, worker.stdout, "`stdout` should be defined.");
    _utils.assert.call(void 0, worker.stderr, "`stderr` should be defined.");
    worker.stdout.on("data", (data) => {
      stdout += data.toString();
    });
    worker.stderr.on("data", (data) => {
      stderr += data.toString();
    });
    worker.on("exit", (exitCode) => {
      const output = {
        stdout,
        stderr
      };
      if (exitCode === 0) {
        return resolve(output);
      }
      return reject(
        new SnapEvalError(
          `Process exited with non-zero exit code: ${exitCode}.`,
          output
        )
      );
    });
  });
}




exports.SnapEvalError = SnapEvalError; exports.evalBundle = evalBundle;
//# sourceMappingURL=chunk-XWYJQWHG.js.map
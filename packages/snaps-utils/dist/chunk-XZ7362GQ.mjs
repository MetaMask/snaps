import { fileURLToPath } from 'url'
import path from 'path'

const getFilename = () => fileURLToPath(import.meta.url)
const getDirname = () => path.dirname(getFilename())

export const __dirname = /* @__PURE__ */ getDirname()
import {
  validateFilePath
} from "./chunk-X3UZCGO5.mjs";

// src/eval.ts
import { assert } from "@metamask/utils";
import { fork } from "child_process";
import { join } from "path";
var SnapEvalError = class extends Error {
  constructor(message, output) {
    super(message);
    this.name = "SnapEvalError";
    this.output = output;
  }
};
async function evalBundle(bundlePath) {
  await validateFilePath(bundlePath);
  return new Promise((resolve, reject) => {
    const worker = fork(join(__dirname, "eval-worker.js"), [bundlePath], {
      // To avoid printing the output of the worker to the console, we set
      // `stdio` to `pipe` and handle the output ourselves.
      stdio: "pipe"
    });
    let stdout = "";
    let stderr = "";
    assert(worker.stdout, "`stdout` should be defined.");
    assert(worker.stderr, "`stderr` should be defined.");
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

export {
  SnapEvalError,
  evalBundle
};
//# sourceMappingURL=chunk-XZ7362GQ.mjs.map
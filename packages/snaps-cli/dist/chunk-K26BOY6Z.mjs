import {
  evaluate
} from "./chunk-3WWFQLH4.mjs";
import {
  getRelativePath
} from "./chunk-TDSL55B3.mjs";
import {
  executeSteps
} from "./chunk-YCYGKEXF.mjs";
import {
  CommandError
} from "./chunk-X7TESUC7.mjs";

// src/commands/eval/eval.ts
import { isFile } from "@metamask/snaps-utils/node";
import { resolve } from "path";
var steps = [
  {
    name: "Checking the input file.",
    task: async ({ input }) => {
      if (!await isFile(input)) {
        const relativePath = getRelativePath(input);
        throw new CommandError(
          `Input file not found: "${relativePath}". Make sure that the "input" field in your snap config or the specified input file is correct.`
        );
      }
    }
  },
  {
    name: "Evaluating the snap bundle.",
    task: async ({ input, spinner }) => {
      await evaluate(input);
      spinner.succeed("Snap bundle evaluated successfully.");
    }
  }
];
function getBundlePath(config, options) {
  if (options.input) {
    return resolve(process.cwd(), options.input);
  }
  return resolve(config.output.path, config.output.filename);
}
async function evaluateHandler(config, options = {}) {
  const input = getBundlePath(config, options);
  await executeSteps(steps, { input });
}

export {
  evaluateHandler
};
//# sourceMappingURL=chunk-K26BOY6Z.mjs.map
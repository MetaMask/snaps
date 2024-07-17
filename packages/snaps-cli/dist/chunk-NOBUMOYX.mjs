import {
  build
} from "./chunk-CZRGAFVI.mjs";
import {
  evaluate
} from "./chunk-3WWFQLH4.mjs";
import {
  executeSteps
} from "./chunk-YCYGKEXF.mjs";
import {
  info
} from "./chunk-ZAW4ZWQX.mjs";
import {
  CommandError
} from "./chunk-X7TESUC7.mjs";

// src/commands/build/build.ts
import { isFile } from "@metamask/snaps-utils/node";
import { resolve as pathResolve } from "path";
var steps = [
  {
    name: "Checking the input file.",
    task: async ({ config }) => {
      const { input } = config;
      if (!await isFile(input)) {
        throw new CommandError(
          `Input file not found: "${input}". Make sure that the "input" field in your snap config is correct.`
        );
      }
    }
  },
  {
    name: "Building the snap bundle.",
    task: async ({ config, spinner }) => {
      return await build(config, { evaluate: false, spinner });
    }
  },
  {
    name: "Evaluating the snap bundle.",
    condition: ({ config }) => config.evaluate,
    task: async ({ config, spinner }) => {
      const path = pathResolve(
        process.cwd(),
        config.output.path,
        config.output.filename
      );
      await evaluate(path);
      info(`Snap bundle evaluated successfully.`, spinner);
    }
  }
];
async function buildHandler(config) {
  return await executeSteps(steps, {
    config
  });
}

export {
  buildHandler
};
//# sourceMappingURL=chunk-NOBUMOYX.mjs.map
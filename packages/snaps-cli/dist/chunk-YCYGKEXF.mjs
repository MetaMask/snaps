import {
  getErrorMessage
} from "./chunk-7RHK2YTB.mjs";
import {
  error
} from "./chunk-ZAW4ZWQX.mjs";

// src/utils/steps.ts
import { dim } from "chalk";
import createSpinner from "ora";
async function executeSteps(steps, context) {
  const spinner = createSpinner({
    // Ora writes to `process.stderr` by default.
    stream: process.stdout
  });
  spinner.start();
  try {
    for (const step of steps) {
      if (step.condition && !step.condition(context)) {
        continue;
      }
      spinner.start(dim(step.name));
      await step.task({
        ...context,
        spinner
      });
    }
    if (spinner.isSpinning) {
      spinner.succeed("Done!");
    }
  } catch (_error) {
    error(getErrorMessage(_error), spinner);
    spinner.stop();
    process.exitCode = 1;
  }
}

export {
  executeSteps
};
//# sourceMappingURL=chunk-YCYGKEXF.mjs.map
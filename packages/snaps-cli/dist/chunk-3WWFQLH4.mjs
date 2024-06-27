import {
  CommandError
} from "./chunk-X7TESUC7.mjs";

// src/commands/eval/implementation.ts
import { evalBundle, SnapEvalError, indent } from "@metamask/snaps-utils/node";
import { red } from "chalk";
async function evaluate(path) {
  try {
    return await evalBundle(path);
  } catch (evalError) {
    if (evalError instanceof SnapEvalError) {
      throw new CommandError(
        `Failed to evaluate snap bundle in SES. This is likely due to an incompatibility with the SES environment in your snap.
Received the following error from the SES environment:

${indent(
          red(evalError.output.stderr),
          2
        )}`
      );
    }
    throw evalError;
  }
}

export {
  evaluate
};
//# sourceMappingURL=chunk-3WWFQLH4.mjs.map
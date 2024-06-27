import {
  error,
  info,
  warn
} from "./chunk-ZAW4ZWQX.mjs";

// src/commands/manifest/implementation.ts
import { checkManifest, indent } from "@metamask/snaps-utils/node";
import { red, yellow } from "chalk";
import { dirname } from "path";
async function manifest(path, write, spinner) {
  const { warnings, errors, updated } = await checkManifest(
    dirname(path),
    write
  );
  if (write && updated) {
    info("The snap manifest file has been updated.", spinner);
  }
  if (!write && errors.length > 0) {
    const formattedErrors = errors.map((manifestError) => indent(red(`\u2022 ${manifestError}`))).join("\n");
    error(
      `The snap manifest file is invalid.

${formattedErrors}

Run the command with the \`--fix\` flag to attempt to fix the manifest.`,
      spinner
    );
    spinner?.stop();
    process.exitCode = 1;
    return false;
  }
  if (warnings.length > 0) {
    const formattedWarnings = warnings.map(
      (manifestWarning) => indent(yellow(`\u2022 ${manifestWarning}`))
    );
    warn(
      `The snap manifest file has warnings.

${formattedWarnings.join("\n")}`,
      spinner
    );
  }
  return true;
}

export {
  manifest
};
//# sourceMappingURL=chunk-2SUDRRT6.mjs.map
import {
  manifest
} from "./chunk-2SUDRRT6.mjs";
import {
  executeSteps
} from "./chunk-YCYGKEXF.mjs";
import {
  CommandError
} from "./chunk-X7TESUC7.mjs";

// src/commands/manifest/manifest.ts
import { isFile } from "@metamask/snaps-utils/node";
var steps = [
  {
    name: "Checking the input file.",
    task: async ({ input }) => {
      if (!await isFile(input)) {
        throw new CommandError(
          `Manifest file not found: "${input}". Make sure that the \`snap.manifest.json\` file exists.`
        );
      }
    }
  },
  {
    name: "Validating the snap manifest.",
    task: async ({ input, config, options, spinner }) => {
      const write = getWriteManifest(config, options);
      const valid = await manifest(input, write, spinner);
      if (valid) {
        spinner.succeed("The snap manifest file is valid.");
      }
    }
  }
];
function getWriteManifest(config, options) {
  if (typeof options.fix === "boolean") {
    return options.fix;
  }
  return config.legacy?.writeManifest ?? false;
}
async function manifestHandler(config, options) {
  await executeSteps(steps, {
    input: config.manifest.path,
    config,
    options
  });
}

export {
  manifestHandler
};
//# sourceMappingURL=chunk-PFB25A2Q.mjs.map
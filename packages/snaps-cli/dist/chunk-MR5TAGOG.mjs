import {
  watch
} from "./chunk-BAEGXYL7.mjs";
import {
  getServer
} from "./chunk-SYRWT2KT.mjs";
import {
  executeSteps
} from "./chunk-YCYGKEXF.mjs";
import {
  info
} from "./chunk-ZAW4ZWQX.mjs";
import {
  CommandError
} from "./chunk-X7TESUC7.mjs";

// src/commands/watch/watch.ts
import { isFile } from "@metamask/snaps-utils/node";
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
    name: "Starting the development server.",
    condition: ({ config }) => config.server.enabled,
    task: async ({ config, options, spinner }) => {
      const server = getServer(config);
      const { port } = await server.listen(options.port ?? config.server.port);
      info(`The server is listening on http://localhost:${port}.`, spinner);
    }
  },
  {
    name: "Building the snap bundle.",
    task: async ({ config, spinner }) => {
      await watch(config, { spinner });
    }
  }
];
async function watchHandler(config, options) {
  await executeSteps(steps, { config, options });
}

export {
  watchHandler
};
//# sourceMappingURL=chunk-MR5TAGOG.mjs.map
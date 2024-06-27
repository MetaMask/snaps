import {
  initCommand
} from "./chunk-ACAPHXDI.mjs";
import {
  builders_default
} from "./chunk-T2BEIWVD.mjs";

// src/cli.ts
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
async function cli(argv, initCommand2 = initCommand) {
  await yargs(hideBin(argv)).scriptName("create-snap").usage("Usage: $0 [directory-name]").example(
    "$0 my-new-snap",
    `	Initialize a snap project in the 'my-new-snap' directory`
  ).command(initCommand2).option("verboseErrors", builders_default.verboseErrors).strict().help().alias("help", "h").parseAsync();
}

export {
  cli
};
//# sourceMappingURL=chunk-2WVRVETI.mjs.map
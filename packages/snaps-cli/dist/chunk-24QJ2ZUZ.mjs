import {
  getConfigByArgv
} from "./chunk-NR4OJOGX.mjs";
import {
  sanitizeInputs
} from "./chunk-L72RLBV5.mjs";
import {
  getYargsErrorMessage
} from "./chunk-7RHK2YTB.mjs";
import {
  error
} from "./chunk-ZAW4ZWQX.mjs";
import {
  builders_default
} from "./chunk-MR44GPM3.mjs";

// src/cli.ts
import packageJson from "@metamask/snaps-cli/package.json";
import semver from "semver";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
function checkNodeVersion(nodeVersion = process.version.slice(1)) {
  const versionRange = packageJson.engines.node;
  const minimumVersion = semver.minVersion(versionRange).format();
  if (!semver.satisfies(nodeVersion, versionRange)) {
    error(
      `Node version ${nodeVersion} is not supported. Please use Node ${minimumVersion} or later.`
    );
    process.exit(1);
  }
}
async function cli(argv, commands) {
  checkNodeVersion();
  await yargs(hideBin(argv)).scriptName("mm-snap").usage("Usage: $0 <command> [options]").example("$0 build", `Build './src/index.js' as './dist/bundle.js'`).example(
    "$0 build --config ./snap.config.build.ts",
    `Build './src/index.js' as './dist/bundle.js' using the config in './snap.config.build.ts'`
  ).example("$0 manifest --fix", `Check the snap manifest, and fix any errors`).example(
    "$0 watch --port 8000",
    `The snap input file for changes, and serve it on port 8000`
  ).example("$0 serve --port 8000", `Serve the snap bundle on port 8000`).command(commands).option("config", builders_default.config).option("verboseErrors", builders_default.verboseErrors).option("suppressWarnings", builders_default.suppressWarnings).strict().middleware(async (args) => {
    args.context = {
      config: await getConfigByArgv(args)
    };
    sanitizeInputs(args);
  }, false).demandCommand(1, "You must specify at least one command.").fail((message, failure) => {
    error(getYargsErrorMessage(message, failure));
    process.exit(1);
  }).help().alias("help", "h").parseAsync();
}

export {
  checkNodeVersion,
  cli
};
//# sourceMappingURL=chunk-24QJ2ZUZ.mjs.map
import semver from 'semver';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import builders from './builders';
import { getConfigByArgv } from './config';
import { error, getYargsErrorMessage, sanitizeInputs } from './utils';

const MINIMUM_NODE_16_VERSION = '16.17.0';
const MINIMUM_NODE_18_VERSION = '18.6.0';

/**
 * Check the Node version. If the Node version is less than the minimum required
 * version, this logs an error and exits the process.
 *
 * @param nodeVersion - The Node version to check.
 */
export function checkNodeVersion(
  nodeVersion: string = process.version.slice(1),
) {
  const majorVersion = semver.major(nodeVersion);
  const message = `Node version ${nodeVersion} is not supported. Please use Node ${MINIMUM_NODE_16_VERSION} or later.`;

  if (majorVersion < 16) {
    error(message);
    // eslint-disable-next-line n/no-process-exit
    process.exit(1);
  }

  // Node 16 and 18 have a different minimum version requirement, so we need to
  // check for both.
  if (majorVersion === 16 && semver.lt(nodeVersion, MINIMUM_NODE_16_VERSION)) {
    error(message);
    // eslint-disable-next-line n/no-process-exit
    process.exit(1);
  }

  if (majorVersion === 18 && semver.lt(nodeVersion, MINIMUM_NODE_18_VERSION)) {
    error(
      `Node version ${nodeVersion} is not supported. Please use Node ${MINIMUM_NODE_18_VERSION} or later.`,
    );
    // eslint-disable-next-line n/no-process-exit
    process.exit(1);
  }
}

/**
 * The main CLI entry point function. This processes the command line args, and
 * runs the appropriate function.
 *
 * @param argv - The raw command line arguments, i.e., `process.argv`.
 * @param commands - The list of commands to use.
 */
export async function cli(argv: string[], commands: any) {
  checkNodeVersion();

  await yargs(hideBin(argv))
    .scriptName('mm-snap')
    .usage('Usage: $0 <command> [options]')

    .example('$0 build', `Build './src/index.js' as './dist/bundle.js'`)
    .example(
      '$0 build --config ./snap.config.build.ts',
      `Build './src/index.js' as './dist/bundle.js' using the config in './snap.config.build.ts'`,
    )
    .example('$0 manifest --fix', `Check the snap manifest, and fix any errors`)
    .example(
      '$0 watch --port 8000',
      `The snap input file for changes, and serve it on port 8000`,
    )
    .example('$0 serve --port 8000', `Serve the snap bundle on port 8000`)

    .command(commands)

    .option('config', builders.config)
    .option('verboseErrors', builders.verboseErrors)
    .option('suppressWarnings', builders.suppressWarnings)

    .strict()

    .middleware(async (args: any) => {
      // eslint-disable-next-line require-atomic-updates
      args.context = {
        config: await getConfigByArgv(args),
      };

      sanitizeInputs(args);
    }, false)

    .demandCommand(1, 'You must specify at least one command.')

    .fail((message, failure) => {
      error(getYargsErrorMessage(message, failure));
      // eslint-disable-next-line n/no-process-exit
      process.exit(1);
    })

    .help()
    .alias('help', 'h')
    .parseAsync();
}

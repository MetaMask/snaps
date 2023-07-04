import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import builders from './builders';
import { getConfigByArgv } from './config';
import { error, getErrorMessage, sanitizeInputs } from './utils';

/**
 * The main CLI entry point function. This processes the command line args, and
 * runs the appropriate function.
 *
 * @param argv - The raw command line arguments, i.e., `process.argv`.
 * @param commands - The list of commands to use.
 */
export async function cli(argv: string[], commands: any) {
  await yargs(hideBin(argv))
    .scriptName('mm-snap')
    .usage('Usage: $0 <command> [options]')

    .example('$0 build', `Build './src/index.js' as './dist/bundle.js'`)
    .example(
      '$0 build --config-file ./snap.config.build.ts',
      `Build './src/index.js' as './dist/bundle.js' using the config in './snap.config.build.ts'`,
    )
    .example('$0 manifest --fix', `Check the snap manifest, and fix any errors`)

    .command(commands)

    .option('config-file', builders.configFile)
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
      error(failure ? getErrorMessage(failure) : message);
      process.exit(1);
    })

    .help()
    .alias('help', 'h')
    .parseAsync();
}

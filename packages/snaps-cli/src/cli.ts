import { logError } from '@metamask/snaps-utils';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import builders from './builders';
import { getConfigByArgv } from './config';
import { sanitizeInputs } from './utils';

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

    .example('$0 init', `\tInitialize a snap project in the current directory`)
    .example(
      '$0 init my-snap',
      `\tInitialize a snap project in the 'my-snap' directory`,
    )
    .example(
      '$0 build -s src/index.js -d out',
      `\tBuild 'src/index.js' as './out/bundle.js'`,
    )
    .example(
      '$0 build -s src/index.js -d out -n snap.js',
      `\tBuild 'src/index.js' as './out/snap.js'`,
    )
    .example('$0 serve -r out', `\tServe files in './out' on port 8080`)
    .example('$0 serve -r out -p 9000', `\tServe files in './out' on port 9000`)
    .example(
      '$0 watch -s src/index.js -d out',
      `\tRebuild './out/bundle.js' on changes to files in 'src/index.js' parent and child directories`,
    )

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

    .fail((message: string, error: Error, _yargs) => {
      logError(message, error);
      process.exitCode = 1;
    })

    .demandCommand(1, 'You must specify at least one command.')

    .help()
    .alias('help', 'h')
    .parseAsync();
}

import { utils as snapsCliUtils } from '@metamask/snaps-cli';
import yargs from 'yargs';

import builders from './builders';
import { init } from './cmds';

/**
 * The main CLI entry point function. This processes the command line args, and
 * runs the appropriate function.
 *
 * @param argv - The raw command line arguments, i.e., `process.argv`.
 * @param initCommand - Optional specification for init command.
 */
export function cli(argv: string[], initCommand: typeof init = init): void {
  const rawArgv = argv.slice(2);
  // eslint-disable-next-line @typescript-eslint/no-unused-expressions, @typescript-eslint/no-floating-promises
  yargs(rawArgv)
    .scriptName('create-snap')
    .usage('Usage: $0 [directory-name]')

    .example(
      '$0 my-new-snap',
      `\tInitialize a snap project in the 'my-new-snap' directory`,
    )
    .command(initCommand)

    .option('verboseErrors', builders.verboseErrors)

    .strict()

    .fail((message: string, error: Error) => {
      snapsCliUtils.logError(message, error);
      process.exitCode = 1;
    })
    .help()
    .alias('help', 'h').argv;
}

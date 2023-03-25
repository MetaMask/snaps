import yargs from 'yargs';

import builders from './builders';
import { init } from './cmds';
import { logError } from './utils';

/**
 * The main CLI entry point function. This processes the command line args, and
 * runs the appropriate function.
 *
 * @param argv - The raw command line arguments, i.e., `process.argv`.
 * @param initCommand - Optional specification for init command.
 */
export function cli(argv: string[], initCommand?: typeof init): void {
  const rawArgv = argv.slice(2);
  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
  yargs(rawArgv)
    .scriptName('create-metamask-snap')
    .usage('Usage: $0 [directory-name]')

    .example(
      '$0 my-new-snap',
      `\tInitialize a snap project in the 'my-new-snap' directory`,
    )
    .command(initCommand ?? init)

    .option('verboseErrors', builders.verboseErrors)

    .strict()

    .fail((message: string, error: Error, _yargs) => {
      logError(message, error);
      process.exitCode = 1;
    })
    .help()
    .alias('help', 'h').argv;
}

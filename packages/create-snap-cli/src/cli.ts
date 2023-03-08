import yargs, { Arguments } from 'yargs';
import yargsType from 'yargs/yargs';

import { init } from './cmds';
import { applyConfig, loadConfig, logError } from './utils';

/**
 * The main CLI entry point function. This processes the command line args, and
 * runs the appropriate function.
 *
 * @param argv - The raw command line arguments, i.e., `process.argv`.
 */
export function cli(argv: string[]): void {
  const rawArgv = argv.slice(2);
  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
  yargs(rawArgv)
    .scriptName('create-metamask-snap')
    .usage('Usage: $0 [directory-name]')

    .example(
      '$0 my-new-snap',
      `\tInitialize a snap project in the 'my-new-snap' directory`,
    )
    .command(init)

    .strict()

    // Typecast: The @types/yargs type for .middleware is incorrect.
    // yargs middleware functions receive the yargs instance as a second parameter.
    // ref: https://yargs.js.org/docs/#api-reference-middlewarecallbacks-applybeforevalidation
    .middleware(
      ((yargsArgv: Arguments, yargsInstance: typeof yargsType) => {
        applyConfig(loadConfig(), rawArgv, yargsArgv, yargsInstance);
      }) as any,
      true,
    )

    .fail((message: string, error: Error, _yargs) => {
      logError(message, error);
      process.exitCode = 1;
    })
    .help()
    .alias('help', 'h').argv;
}

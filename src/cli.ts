import yargs from 'yargs/yargs';
import { SnapsCliGlobals } from './types/package';
import { assignGlobals, sanitizeInputs } from './utils';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface Global extends SnapsCliGlobals {}
  }
}

export function cli(argv: string[], commands: any): void {
  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
  yargs(argv.slice(2))

    .usage('Usage: $0 <command> [options]')

    .example('$0 init', `\tInitialize Snap package from scratch`)
    .example('$0 build -s index.js -d out', `\tBuild 'index.js' as './out/bundle.js'`)
    .example('$0 build -s index.js -d out -n snap.js', `\tBuild 'index.js' as './out/snap.js'`)
    .example('$0 serve -r out', `\tServe files in './out' on port 8080`)
    .example('$0 serve -r out -p 9000', `\tServe files in './out' on port 9000`)
    .example('$0 watch -s index.js -d out', `\tRebuild './out/bundle.js' on changes to files in 'index.js' parent and child directories`)

    .command(commands)

    .option('verboseErrors', {
      alias: ['v', 'verboseErrors'],
      type: 'boolean',
      describe: 'Display original errors',
      required: false,
      default: false,
    })

    .option('suppressWarnings', {
      alias: ['sw', 'suppressWarnings'],
      type: 'boolean',
      describe: 'Suppress warnings',
      required: false,
      default: false,
    })

    .strict()

    .middleware((yargsArgv) => {
      assignGlobals(yargsArgv);
      sanitizeInputs(yargsArgv);
    })

    .fail((msg: string, err: Error, _yargs) => {
      console.error(msg || err.message);
      if (err?.stack && global.snaps.verboseErrors) {
        console.error(err.stack);
      }
      process.exit(1);
    })

    .demandCommand(1, 'You must specify at least one command.')

    .help()
    .alias('help', 'h')

    .argv;
}

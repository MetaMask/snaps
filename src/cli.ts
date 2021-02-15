import yargs from 'yargs/yargs';
import { SnapsCliGlobals } from './types/package';
import { applyConfig, sanitizeInputs, setSnapGlobals } from './utils';
import builders from './builders';

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

    .option('verboseErrors', builders.verboseErrors)

    .option('suppressWarnings', builders.suppressWarnings)

    .strict()

    .middleware(async (yargsArgv) => {
      // Some globals affect error logging, and applyConfig may error.
      // Therefore, we set globals from the yargs argv object before applying
      // defaults from the config, and then set the globals again after, to
      // ensure that inline options are preferred over any config files.
      // This is ugly, but cheap.
      setSnapGlobals(yargsArgv);
      await applyConfig(yargsArgv);
      setSnapGlobals(yargsArgv);
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

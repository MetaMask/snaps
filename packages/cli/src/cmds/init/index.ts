import yargs from 'yargs';
import builders from '../../builders';
import { YargsArgs } from '../../types/yargs';
import { build } from '../build/buildHandler';
import { initHandler } from './initHandler';

export = {
  command: ['init [directory]', 'i [directory]'],
  desc: 'Initialize Snap package',
  builder: (yarg: yargs.Argv) => {
    yarg
      .option('src', builders.src)
      .option('dist', builders.dist)
      .option('port', builders.port)
      .option('outfileName', builders.outfileName)
      .option('template', builders.template);
  },
  handler: (argv: YargsArgs) => init(argv),
};

/**
 * The main entrypoint for the init command. This calls the init handler to
 * initialize the snap package, builds the snap, and then updates the manifest
 * with the shasum of the built snap.
 *
 * @param argv - The Yargs arguments object.
 */
async function init(argv: YargsArgs): Promise<void> {
  console.log();
  const newArgs = await initHandler(argv);

  process.chdir(newArgs.snapLocation);

  await build({
    ...newArgs,
    manifest: false,
    eval: true,
  });

  console.log('\nSnap project successfully initiated!');
}

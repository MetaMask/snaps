import yargs, { Arguments } from 'yargs';
import builders from '../../builders';
import { YargsArgs } from '../../types/yargs';
import { build } from '../build/buildHandler';
import { initHandler, updateManifestShasum } from './initHandler';
import { correctDefaultArgs } from './initUtils';

export = {
  command: ['init', 'i'],
  desc: 'Initialize Snap package',
  builder: (yarg: yargs.Argv) => {
    yarg
      .option('src', builders.src)
      .option('dist', builders.dist)
      .option('port', builders.port)
      .option('outfileName', builders.outfileName)
      .option('template', builders.template)
      .middleware(
        ((yargsArgv: Arguments) => {
          correctDefaultArgs(yargsArgv);
        }) as any,
        true,
      );
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

  await build({
    ...newArgs,
    manifest: false,
    eval: true,
  });

  await updateManifestShasum();

  console.log('\nSnap project successfully initiated!');
}

import yargs from 'yargs';
import builders from '../../builders';
import { YargsArgs } from '../../types/yargs';
import { build } from '../build/buildHandler';
import { initHandler, updateManifestShasum } from './initHandler';

export = {
  command: ['init', 'i'],
  desc: 'Initialize Snap package',
  builder: (yarg: yargs.Argv) => {
    yarg
      .option('src', builders.src)
      .option('dist', builders.dist)
      .option('port', builders.port)
      .option('outfileName', builders.outfileName);
  },
  handler: (argv: YargsArgs) => init(argv),
};

async function init(argv: YargsArgs): Promise<void> {
  console.log();
  const newArgs = await initHandler(argv);
  if (!newArgs) {
    return;
  }

  await build({
    ...newArgs,
    manifest: false,
    eval: true,
  });

  await updateManifestShasum();

  console.log('\nSnap project successfully initiated!');
}

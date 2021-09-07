import yargs from 'yargs';
import builders from '../../builders';
import { YargsArgs } from '../../types/yargs';
import { build } from '../build/buildHandler';
import { initHandler } from './initHandler';

export = {
  command: ['init', 'i'],
  desc: 'Initialize Snap package',
  builder: (yarg: yargs.Argv) => {
    yarg
      .option('src', builders.src)
      .option('dist', builders.dist)
      .option('outfileName', builders.outfileName)
      .option('port', builders.port);
  },
  handler: (argv: YargsArgs) => init(argv),
};

async function init(argv: YargsArgs): Promise<void> {
  console.log();
  const newArgs = await initHandler(argv);

  await build({
    ...newArgs,
    manifest: false,
    eval: true,
  });

  console.log('\nPlugin project successfully initiated!');
}

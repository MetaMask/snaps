import yargs from 'yargs';
import builders from '../../builders';
import { YargsArgs } from '../../types/yargs';
import { watch } from './watchHandler';

export = {
  command: ['watch', 'w'],
  desc: 'Build Snap on change',
  builder: (yarg: yargs.Argv) => {
    yarg
      .option('src', builders.src)
      .option('dist', builders.dist)
      .option('outfileName', builders.outfileName)
      .option('sourceMaps', builders.sourceMaps)
      .option('stripComments', builders.stripComments);
  },
  handler: (argv: YargsArgs) => watch(argv),
};

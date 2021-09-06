import yargs from 'yargs';
import builders from '../../builders';
import { YargsArgs } from '../../types/yargs';
import { build } from './buildHandler';

export = {
  command: ['build', 'b'],
  desc: 'Build Snap from source',
  builder: (yarg: yargs.Argv) => {
    yarg
      .option('src', builders.src)
      .option('dist', builders.dist)
      .option('outfileName', builders.outfileName)
      .option('sourceMaps', builders.sourceMaps)
      .option('stripComments', builders.stripComments)
      .option('port', builders.port)
      .option('eval', builders.eval)
      .option('manifest', builders.manifest)
      .option('populate', builders.populate)
      .implies('populate', 'manifest');
  },
  handler: (argv: YargsArgs) => build(argv),
};

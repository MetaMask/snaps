import yargs from 'yargs';
import builders from '../../builders';
import { YargsArgs } from '../../types/yargs';
import { build } from './buildHandler';

export = {
  command: ['build', 'b'],
  desc: 'Build Snap from source',
  builder: (yarg: yargs.Argv) => {
    yarg
      .option('dist', builders.dist)
      .option('eval', builders.eval)
      .option('manifest', builders.manifest)
      .option('outfileName', builders.outfileName)
      .option('sourceMaps', builders.sourceMaps)
      .option('src', builders.src)
      .option('stripComments', builders.stripComments)
      .option('transpilationMode', builders.transpilationMode)
      .option('writeManifest', builders.writeManifest)
      .implies('writeManifest', 'manifest');
  },
  handler: (argv: YargsArgs) => build(argv),
};

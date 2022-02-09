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
      .option('eval', builders.eval)
      .option('dist', builders.dist)
      .option('outfileName', builders.outfileName)
      .option('sourceMaps', builders.sourceMaps)
      .option('stripComments', builders.stripComments)
      .option('transformHtmlComments', builders.transformHtmlComments)
      .option('manifest', builders.manifest)
      .option('writeManifest', builders.writeManifest)
      .implies('writeManifest', 'manifest');
  },
  handler: (argv: YargsArgs) => watch(argv),
};

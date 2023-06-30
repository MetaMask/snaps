import yargs from 'yargs';

import builders from '../../builders';
import { YargsArgs } from '../../types/yargs';
import { processInvalidTranspilation } from '../build/utils';
import { watch } from './watchHandler';

const command = {
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
      .option('transpilationMode', builders.transpilationMode)
      .option('depsToTranspile', builders.depsToTranspile)
      .option('manifest', builders.manifest)
      .option('writeManifest', builders.writeManifest)
      .option('serve', builders.serve)
      .option('root', builders.root)
      .option('port', builders.port)
      .implies('writeManifest', 'manifest')
      .implies('depsToTranspile', 'transpilationMode')
      .middleware((argv) => processInvalidTranspilation(argv as any));
  },
  handler: async (argv: YargsArgs) => watch(argv),
};

export default command;

import type yargs from 'yargs';

import builders from '../../builders';
import type { YargsArgs } from '../../types/yargs';
import { buildHandler } from './build';
import { processInvalidTranspilation } from './legacy/utils';

const command = {
  command: ['build', 'b'],
  desc: 'Build snap from source',
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
      .option('depsToTranspile', builders.depsToTranspile)
      .option('writeManifest', builders.writeManifest)
      .implies('writeManifest', 'manifest')
      .implies('depsToTranspile', 'transpilationMode')
      .middleware((argv) => processInvalidTranspilation(argv as any));
  },
  handler: async (argv: YargsArgs) => buildHandler(argv.context.config),
};

export * from './implementation';
export default command;

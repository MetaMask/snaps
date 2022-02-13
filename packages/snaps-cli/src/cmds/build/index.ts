import yargs from 'yargs';
import builders from '../../builders';
import { YargsArgs } from '../../types/yargs';
import { build } from './buildHandler';
import { processDependencies } from './bundleUtils';

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
      .option('transpiledDeps', builders.transpiledDeps)
      .option('writeManifest', builders.writeManifest)
      .implies('writeManifest', 'manifest')
      .implies('transpiledDeps', 'transpilationMode')
      .middleware((argv) => {
        if (!argv.transpilationMode) {
          return;
        }

        if (argv.transpiledDeps && argv.transpilationMode !== 'localAndDeps') {
          throw Error(
            'Transpilation mode must be localAndDeps in order to transpile dependencies',
          );
        } else if (argv.transpiledDeps) {
          processDependencies(argv as any);
        }
      });
  },
  handler: (argv: YargsArgs) => build(argv),
};

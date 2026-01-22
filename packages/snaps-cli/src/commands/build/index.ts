import type yargs from 'yargs';

import { buildHandler } from './build';
import builders from '../../builders';
import type { YargsArgs } from '../../types/yargs';
import { getConfigWithManifest } from '../../utils';

const command = {
  command: ['build', 'b'],
  desc: 'Build snap from source',
  builder: (yarg: yargs.Argv) => {
    yarg
      .option('analyze', builders.analyze)
      .option('preinstalled', builders.preinstalled)
      .option('manifest', builders.manifest)
      .check((argv) => {
        if (argv.manifest && !argv.preinstalled) {
          throw new Error(
            'The `--manifest` option requires the `--preinstalled` flag to be set.',
          );
        }

        return true;
      });
  },
  handler: async (argv: YargsArgs) =>
    buildHandler(getConfigWithManifest(argv.context.config, argv.manifest), {
      analyze: argv.analyze,
      preinstalled: argv.preinstalled,
    }),
};

export * from './implementation';
export { steps } from './build';
export default command;

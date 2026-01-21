import type yargs from 'yargs';

import { watchHandler } from './watch';
import builders from '../../builders';
import type { YargsArgs } from '../../types/yargs';
import { getConfigWithManifest } from '../../utils';

const command = {
  command: ['watch', 'w'],
  desc: 'Build Snap on change',
  builder: (yarg: yargs.Argv) => {
    yarg.option('port', builders.port).option('manifest', builders.manifest);
  },
  handler: async (argv: YargsArgs) => {
    return await watchHandler(
      getConfigWithManifest(argv.context.config, argv.manifest),
      {
        port: argv.port,
      },
    );
  },
};

export * from './implementation';
export default command;

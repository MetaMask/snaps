import type yargs from 'yargs';

import { watchHandler } from './watch';
import builders from '../../builders';
import type { YargsArgs } from '../../types/yargs';

const command = {
  command: ['watch', 'w'],
  desc: 'Build Snap on change',
  builder: (yarg: yargs.Argv) => {
    yarg.option('port', builders.port);
  },
  handler: async (argv: YargsArgs) =>
    watchHandler(argv.context.config, {
      port: argv.port,
    }),
};

export * from './implementation';
export default command;

import type yargs from 'yargs';

import { sandboxHandler } from './sandbox';
import builders from '../../builders';
import type { YargsArgs } from '../../types/yargs';

const command = {
  command: ['sandbox'],
  desc: 'Start a sandbox server to interact with the Snap',
  builder: (yarg: yargs.Argv) => {
    yarg.option('build', builders.build);
  },
  handler: async (argv: YargsArgs) =>
    sandboxHandler(argv.context.config, { build: argv.build }),
};

export default command;

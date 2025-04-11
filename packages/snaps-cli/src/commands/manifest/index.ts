import type yargs from 'yargs';

import { manifestHandler } from './manifest';
import builders from '../../builders';
import type { YargsArgs } from '../../types/yargs';

const command = {
  command: ['manifest', 'm'],
  desc: 'Validate the snap.manifest.json file',
  builder: (yarg: yargs.Argv) => {
    yarg.option('fix', builders.fix);
  },
  handler: async (argv: YargsArgs) =>
    manifestHandler(argv.context.config, { fix: argv.fix }),
};

export * from './implementation';
export default command;

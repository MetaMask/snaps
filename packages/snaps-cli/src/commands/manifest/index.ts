import type yargs from 'yargs';

import { manifestHandler } from './manifest';
import builders from '../../builders';
import type { YargsArgs } from '../../types/yargs';

const command = {
  command: ['manifest', 'm'],
  desc: 'Validate the snap.manifest.json file',
  builder: (yarg: yargs.Argv) => {
    yarg.option('fix', builders.fix);
    yarg.option('eval', builders.eval);
  },
  handler: async (argv: YargsArgs) =>
    manifestHandler(argv.context.config, {
      fix: argv.fix,
      eval: argv.eval ?? argv.context.config.evaluate,
    }),
};

export * from './implementation';
export default command;

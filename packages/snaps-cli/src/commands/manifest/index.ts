import type yargs from 'yargs';

import builders from '../../builders';
import type { YargsArgs } from '../../types/yargs';
import { manifest } from './manifest';

const command = {
  command: ['manifest', 'm'],
  desc: 'Validate the snap.manifest.json file',
  builder: (yarg: yargs.Argv) => {
    yarg.option('writeManifest', { ...builders.writeManifest, alias: ['fix'] });
  },
  handler: async (argv: YargsArgs) => manifest(argv.context.config),
};

export default command;

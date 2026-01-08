import { resolve } from 'path';
import type yargs from 'yargs';

import { watchHandler } from './watch';
import builders from '../../builders';
import type { YargsArgs } from '../../types/yargs';

const command = {
  command: ['watch', 'w'],
  desc: 'Build Snap on change',
  builder: (yarg: yargs.Argv) => {
    yarg.option('port', builders.port).option('manifest', builders.manifest);
  },
  handler: async (argv: YargsArgs) => {
    const configWithManifest = argv.manifest
      ? {
          ...argv.context.config,
          manifest: {
            ...argv.context.config.manifest,
            path: resolve(process.cwd(), argv.manifest),
          },
        }
      : argv.context.config;

    return await watchHandler(configWithManifest, {
      port: argv.port,
    });
  },
};

export * from './implementation';
export default command;

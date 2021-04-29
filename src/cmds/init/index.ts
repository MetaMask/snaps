import yargs from 'yargs';
import builders from '../../builders';
import { YargsArgs } from '../../types/yargs';
import { build } from '../build';
import { initHandler } from './initHandler';

module.exports.command = ['init', 'i'];
module.exports.desc = 'Initialize Snap package';
module.exports.builder = (yarg: yargs.Argv) => {
  /* istanbul ignore next */
  yarg
    .option('src', builders.src)
    .option('dist', builders.dist)
    .option('outfileName', builders.outfileName)
    .option('port', builders.port);
};
module.exports.handler = (argv: YargsArgs) => init(argv);

async function init(argv: YargsArgs): Promise<void> {
  console.log();
  const newArgs = await initHandler(argv);

  await build({
    ...newArgs,
    manifest: false,
    eval: true,
  });

  console.log('\nPlugin project successfully initiated!');
}

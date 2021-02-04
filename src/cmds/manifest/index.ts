import yargs from 'yargs';
import builders from '../../builders';
import { logError } from '../../utils';
import { YargsArgs } from '../../types/yargs';
import { manifest } from './manifest';

module.exports.command = ['manifest', 'm'];
module.exports.desc = 'Validate project package.json as a Snap manifest';
module.exports.builder = (yarg: yargs.Argv) => {
  yarg
    .option('dist', builders.dist)
    .option('port', builders.port)
    .option('populate', builders.populate);
};

module.exports.handler = async (argv: YargsArgs) => {
  try {
    await manifest(argv);
  } catch (err) {
    logError(err.message, err);
    process.exit(1);
  }
};

const builders = require('../../builders');
const { logError } = require('../../utils');
const manifest = require('./manifest');

module.exports.command = ['manifest', 'm'];
module.exports.desc = 'Validate project package.json as a Snap manifest';
module.exports.builder = (yarg) => {
  yarg
    .option('dist', builders.dist)
    .option('port', builders.port)
    .option('populate', builders.populate);
};

module.exports.handler = async (argv) => {
  try {
    await manifest(argv);
  } catch (err) {
    logError(err.message, err);
    process.exit(1);
  }
};

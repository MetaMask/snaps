const builders = require('../../builders');
const { handler: build } = require('../build');
const initHandler = require('./initialize');

module.exports.command = ['init', 'i'];
module.exports.desc = 'Initialize Snap package';
module.exports.builder = (yarg) => {
  yarg
    .option('src', builders.src)
    .option('dist', builders.dist)
    .option('outfileName', builders.outfileName)
    .option('port', builders.port);
};
module.exports.handler = (argv) => init(argv);

async function init(argv) {
  const newArgs = await initHandler(argv);

  console.log();

  await build({
    ...newArgs,
    manifest: false,
    eval: true,
  });

  console.log('\nPlugin project successfully initiated!');

  // serve({
  //   ...newArgs,
  //   root: '.',
  // })
}

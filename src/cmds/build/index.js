const builders = require('../../builders');
const {
  getOutfilePath,
  validateDirPath,
  validateFilePath,
  validateOutfileName,
} = require('../../utils');
const { handler: snapEval } = require('../eval');
const { handler: manifest } = require('../manifest');
const { bundle } = require('./bundle');

module.exports.command = ['build', 'b'];
module.exports.desc = 'Build Snap from source';
module.exports.builder = (yarg) => {
  yarg
    .option('src', builders.src)
    .option('dist', builders.dist)
    .option('outfileName', builders.outfileName)
    .option('sourceMaps', builders.sourceMaps)
    .option('stripComments', builders.stripComments)
    .option('port', builders.port)
    .option('eval', builders.eval)
    .option('manifest', builders.manifest)
    .option('populate', builders.populate)
    .option('environment', builders.environment)
    .implies('populate', 'manifest');
};
module.exports.handler = (argv) => build(argv);

/**
 * Builds all files in the given source directory to the given destination
 * directory.
 *
 * Creates destination directory if it doesn't exist.
 *
 * @param {object} argv - argv from Yargs
 * @param {string} argv.src - The source file path
 * @param {string} argv.dist - The output directory path
 * @param {string} argv.outfileName - The output file name
 */
async function build(argv) {

  const { src, dist, outfileName } = argv;
  if (outfileName) {
    validateOutfileName(outfileName);
  }
  await validateFilePath(src);
  await validateDirPath(dist, true);

  const outfilePath = getOutfilePath(dist, outfileName);
  const result = await bundle(src, outfilePath, argv);
  if (result && argv.eval) {
    await snapEval({ ...argv, bundle: outfilePath });
  }

  if (argv.manifest) {
    manifest(argv);
  }
}


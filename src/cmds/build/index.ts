import yargs from 'yargs';
import builders from '../../builders';
import { getOutfilePath, validateDirPath, validateFilePath, validateOutfileName } from '../../utils';
import { snapEval } from '../eval';
import { manifest } from '../manifest/manifest';
import { YargsArgs } from '../../types/yargs';
import { bundle } from './bundle';

module.exports.command = ['build', 'b'];
module.exports.desc = 'Build Snap from source';
module.exports.builder = (yarg: yargs.Argv) => {
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
module.exports.handler = (argv: YargsArgs) => build(argv);

/**
 * Builds all files in the given source directory to the given destination
 * directory.
 *
 * Creates destination directory if it doesn't exist.
 *
 * @param argv - argv from Yargs
 * @param argv.src - The source file path
 * @param argv.dist - The output directory path
 * @param argv.outfileName - The output file name
 */
export async function build(argv: YargsArgs): Promise<void> {

  const { src, dist, outfileName } = argv;
  if (outfileName) {
    validateOutfileName(outfileName as string);
  }
  await validateFilePath(src);
  await validateDirPath(dist, true);

  const outfilePath = getOutfilePath(dist, outfileName as string);
  const result = await bundle(src, outfilePath, argv);
  if (result && argv.eval) {
    await snapEval({ ...argv, bundle: outfilePath });
  }

  if (argv.manifest) {
    manifest(argv);
  }
}


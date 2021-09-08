import {
  getOutfilePath,
  validateDirPath,
  validateFilePath,
  validateOutfileName,
} from '../../utils';
import { snapEval } from '../eval/evalHandler';
import { manifest } from '../manifest/manifestHandler';
import { YargsArgs } from '../../types/yargs';
import { bundle } from './bundle';

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

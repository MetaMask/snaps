import {
  getOutfilePath,
  validateDirPath,
  validateFilePath,
  validateOutfileName,
} from '@metamask/snaps-utils';

import type { YargsArgs } from '../../types/yargs';
import { evalHandler } from '../eval/evalHandler';
import { manifestHandler } from '../manifest/manifestHandler';
import { bundle } from './bundle';

/**
 * Builds all files in the given source directory to the given destination
 * directory.
 *
 * Creates destination directory if it doesn't exist.
 *
 * @param argv - Argv from Yargs.
 * @param argv.src - The source file path.
 * @param argv.dist - The output directory path.
 * @param argv.outfileName - The output file name.
 * @param argv.context - The context object.
 * @param argv.context.config - The config object.
 */
export async function build({
  src,
  dist,
  outfileName,
  context: { config },
}: YargsArgs): Promise<void> {
  if (outfileName) {
    validateOutfileName(outfileName);
  }

  await validateFilePath(src);
  await validateDirPath(dist, true);

  const outfilePath = getOutfilePath(dist, outfileName);
  const result = await bundle(src, outfilePath, argv, config.bundlerCustomizer);
  if (result && argv.eval) {
    await evalHandler({ ...argv, bundle: outfilePath });
  }

  if (argv.manifest) {
    await manifestHandler(argv);
  }
}

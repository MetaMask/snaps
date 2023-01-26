import { evalBundle, logInfo } from '@metamask/snaps-utils';
import { assert } from '@metamask/utils';

import { YargsArgs } from '../../types/yargs';

/**
 * Runs the snap in a worker, to ensure SES compatibility.
 *
 * @param argv - The Yargs arguments object.
 * @returns A promise that resolves once the eval has finished.
 * @throws If the eval failed.
 */
export async function evalHandler(argv: YargsArgs): Promise<void> {
  const { bundle: bundlePath } = argv;

  assert(typeof bundlePath === 'string');

  try {
    await evalBundle(bundlePath);
    logInfo(`Eval Success: evaluated '${bundlePath}' in SES!`);
  } catch (error) {
    throw new Error(`Snap evaluation error: ${error.message}`);
  }
}

import { evalBundle } from '@metamask/snap-utils';
import { YargsArgs } from '../../types/yargs';
import { logError } from '../../utils';

/**
 * Runs the snap in a worker, to ensure SES compatibility.
 *
 * @param argv - The Yargs arguments object.
 * @returns A promise that resolves once the eval has finished.
 * @throws If the eval failed.
 */
export async function evalHandler(argv: YargsArgs): Promise<void> {
  const { bundle: bundlePath } = argv;

  try {
    await evalBundle(bundlePath as string);
    console.log(`Eval Success: evaluated '${bundlePath}' in SES!`);
  } catch (error) {
    logError(`Snap evaluation error: ${error.message}`, error);
    throw error;
  }
}

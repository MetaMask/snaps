import { YargsArgs } from '../../types/yargs';
import { logError, validateFilePath } from '../../utils';
import { workerEval } from './workerEval';

/**
 * Runs the snap in a worker, to ensure SES compatibility.
 *
 * @param argv - The Yargs arguments object.
 * @throws If the eval failed.
 */
export async function snapEval(argv: YargsArgs): Promise<void> {
  const { bundle: bundlePath } = argv;
  await validateFilePath(bundlePath as string);
  try {
    await workerEval(bundlePath as string);
    console.log(`Eval Success: evaluated '${bundlePath}' in SES!`);
  } catch (err) {
    logError(`Snap evaluation error: ${err.message}`, err);
    throw err;
  }
}

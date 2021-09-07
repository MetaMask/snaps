import { YargsArgs } from '../../types/yargs';
import { logError, validateFilePath } from '../../utils';
import { workerEval } from './workerEval';

export async function snapEval(argv: YargsArgs): Promise<boolean> {
  const { bundle: bundlePath } = argv;
  await validateFilePath(bundlePath as string);
  try {
    await workerEval(bundlePath as string);
    console.log(`Eval Success: evaluated '${bundlePath}' in SES!`);
    return true;
  } catch (err) {
    logError(`Snap evaluation error: ${err.message}`, err);
    process.exit(1);
  }
}

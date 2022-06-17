import { fork } from 'child_process';
import pathUtils from 'path';

/**
 * Spawn a new worker thread to run the provided bundle in.
 *
 * @param bundlePath - The path to the bundle to run.
 * @returns `null` if the worker ran successfully.
 * @throws If the worker failed to run successfully.
 */
export function workerEval(bundlePath: string): Promise<null> {
  return new Promise((resolve) => {
    fork(getEvalWorkerPath(), [bundlePath]).on('exit', (exitCode: number) => {
      if (exitCode === 0) {
        resolve(null);
      } else {
        throw new Error(`Worker exited abnormally! Code: ${exitCode}`);
      }
    });
  });
}

/**
 * Get the path to the eval worker file.
 *
 * @returns The path to the eval worker file.
 */
function getEvalWorkerPath(): string {
  return pathUtils.join(__dirname, 'eval-worker.js');
}

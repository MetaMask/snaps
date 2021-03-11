import { Worker } from 'worker_threads';
import pathUtils from 'path';

export function workerEval(bundlePath: string, getWorker = getEvalWorker): Promise<null> {
  return new Promise((resolve, _reject) => {
    getWorker(getEvalWorkerPath())
      .on('exit', (exitCode: number) => {
        if (exitCode === 0) {
          resolve(null);
        } else {
          throw new Error(`Worker exited abnormally! Code: ${exitCode}`);
        }
      })
      .postMessage({
        pluginFilePath: bundlePath,
      });
  });
}

/**
 * @returns The path to the eval worker file.
 */
function getEvalWorkerPath(): string {
  return pathUtils.join(__dirname, 'evalWorker.js');
}

/**
 * @param path - The path to the file which the worker will execute.
 * @returns The worker object.
 */
export function getEvalWorker(path: string): Worker {
  /* istanbul ignore next */
  return new Worker(path);
}

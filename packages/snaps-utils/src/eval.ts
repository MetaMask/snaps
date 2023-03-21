import { fork } from 'child_process';
import { join } from 'path';

import { validateFilePath } from './fs';

/**
 * Spawn a new process to run the provided bundle in.
 *
 * @param bundlePath - The path to the bundle to run.
 * @returns `null` if the worker ran successfully.
 * @throws If the worker failed to run successfully.
 */
export async function evalBundle(bundlePath: string): Promise<null> {
  await validateFilePath(bundlePath);

  return new Promise((resolve, reject) => {
    const worker = fork(join(__dirname, 'eval-worker.js'), [bundlePath]);

    worker.on('exit', (exitCode: number) => {
      if (exitCode === 0) {
        return resolve(null);
      }

      return reject(
        new Error(`Process exited with non-zero exit code: ${exitCode}`),
      );
    });
  });
}

import { assert } from '@metamask/utils';
import { fork } from 'child_process';
import { join } from 'path';

import { validateFilePath } from './fs';

export type EvalOutput = {
  stdout: string;
  stderr: string;
};

export class SnapEvalError extends Error {
  readonly output: EvalOutput;

  constructor(message: string, output: EvalOutput) {
    super(message);

    this.name = 'SnapEvalError';
    this.output = output;
  }
}

/**
 * Spawn a new process to run the provided bundle in.
 *
 * @param bundlePath - The path to the bundle to run.
 * @returns `null` if the worker ran successfully.
 * @throws If the worker failed to run successfully.
 */
export async function evalBundle(bundlePath: string): Promise<EvalOutput> {
  await validateFilePath(bundlePath);

  return new Promise((resolve, reject) => {
    const worker = fork(join(__dirname, 'eval-worker.js'), [bundlePath], {
      // To avoid printing the output of the worker to the console, we set
      // `stdio` to `pipe` and handle the output ourselves.
      stdio: 'pipe',
    });

    let stdout = '';
    let stderr = '';

    assert(worker.stdout, '`stdout` should be defined.');
    assert(worker.stderr, '`stderr` should be defined.');

    worker.stdout.on('data', (data: Buffer) => {
      stdout += data.toString();
    });

    worker.stderr.on('data', (data: Buffer) => {
      stderr += data.toString();
    });

    worker.on('exit', (exitCode: number) => {
      const output = {
        stdout,
        stderr,
      };

      if (exitCode === 0) {
        return resolve(output);
      }

      return reject(
        new SnapEvalError(
          `Process exited with non-zero exit code: ${exitCode}.`,
          output,
        ),
      );
    });
  });
}

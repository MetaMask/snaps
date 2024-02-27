import { assert } from '@metamask/utils';
import { fork } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

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
 * Get the dirname of the file at the provided `import.meta.url`. This is
 * similar to `__dirname` in CommonJS modules.
 *
 * @param importMetaUrl - The `import.meta.url` of the file to get the dirname
 * of.
 * @returns The dirname of the file at the provided `import.meta.url`.
 */
export function getDirname(importMetaUrl: string): string {
  if (importMetaUrl.startsWith('file://')) {
    return dirname(fileURLToPath(importMetaUrl));
  }

  return dirname(importMetaUrl);
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
    const worker = fork(
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore - `import.meta` is not supported in the current environment.
      join(getDirname(import.meta.url), 'eval-worker.js'),
      [bundlePath],
      {
        // To avoid printing the output of the worker to the console, we set
        // `stdio` to `pipe` and handle the output ourselves.
        stdio: 'pipe',
      },
    );

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

import { LogLevel, runner, TestRunner } from 'clet';
import { join } from 'path';

export const SNAP_DIR = join('..', 'examples/examples/typescript');

type RunOptions = {
  command: string;
  options?: string[];
  workingDirectory?: string;
};

/**
 * Get a command runner.
 *
 * @param options - The run options.
 * @param options.command - The `mm-snap` CLI command to run.
 * @param options.options - The options to pass to `mm-snap`.
 * @param options.workingDirectory - The working directory to run the command in.
 * @returns The test runner.
 */
export function run({
  command,
  options = [],
  workingDirectory = SNAP_DIR,
}: RunOptions) {
  const testRunner = runner()
    .debug(LogLevel.Verbose)
    .cwd(workingDirectory)
    .spawn(
      'yarn',
      [
        'ts-node',
        '--require tsconfig-paths/register',
        '--files',
        '--swc',
        join(__dirname, '../main.ts'),
        command,
        ...options,
      ],
      {},
    );

  const originalStdout = testRunner.stdout.bind(testRunner);
  const originalStderr = testRunner.stderr.bind(testRunner);

  testRunner.stdout = (...args: Parameters<typeof originalStdout>) => {
    testRunner.wait('stdout', ...args);
    originalStdout(...args);
    return testRunner;
  };

  testRunner.stderr = (...args: Parameters<typeof originalStderr>) => {
    testRunner.wait('stderr', ...args);
    originalStderr(...args);
    return testRunner;
  };

  return testRunner;
}

/**
 * Kill the test runner. This is useful for testing long-running commands.
 *
 * @param testRunner - The test runner.
 */
export function kill(testRunner: TestRunner) {
  testRunner.proc.kill();
  testRunner.proc.unref();
}

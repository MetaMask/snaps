import { LogLevel, runner } from 'clet';
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
  return (
    runner()
      .debug(LogLevel.ERROR)
      .cwd(workingDirectory)
      // `yarn ts-node --files src/main.ts [command] [options]`
      .spawn(
        'yarn',
        [
          'ts-node',
          '--files',
          join(__dirname, '../main.ts'),
          command,
          ...options,
        ],
        {},
      )
  );
}

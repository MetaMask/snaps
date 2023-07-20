import type { TestRunner } from '../../test-utils';
import { getCommandRunner, SNAP_BROWSERIFY_DIR } from '../../test-utils';

describe('mm-snap build', () => {
  let runner: TestRunner;

  afterEach(() => {
    runner?.kill();
  });

  it.each(['build', 'b'])(
    'builds a snap using "mm-snap %s"',
    async (command) => {
      runner = getCommandRunner(command, []);
      await runner.wait();

      expect(runner.stderr).toStrictEqual([]);
      expect(runner.stdout).toContainEqual(
        expect.stringMatching(/Checking the input file\./u),
      );
      expect(runner.stdout).toContainEqual(
        expect.stringMatching(/Building the snap bundle\./u),
      );
      expect(runner.stdout).toContainEqual(
        expect.stringMatching(/Compiled \d+ files? in \d+ms\./u),
      );
      expect(runner.stdout).toContainEqual(
        expect.stringMatching(/Evaluating the snap bundle\./u),
      );
      expect(runner.exitCode).toBe(0);
    },
  );

  it.each(['build', 'b'])(
    'builds a snap using "mm-snap %s" using a legacy config',
    async (command) => {
      runner = getCommandRunner(command, [], SNAP_BROWSERIFY_DIR);
      await runner.wait();

      expect(runner.stderr).toStrictEqual([]);
      expect(runner.stdout).toContainEqual(
        expect.stringMatching(/Checking the input file\./u),
      );
      expect(runner.stdout).toContainEqual(
        expect.stringMatching(/Building the snap bundle\./u),
      );
      expect(runner.stdout).toContainEqual(
        expect.stringMatching(/Compiled \d+ files? in \d+ms\./u),
      );
      expect(runner.stdout).toContainEqual(
        expect.stringMatching(/Evaluating the snap bundle\./u),
      );
      expect(runner.exitCode).toBe(0);
    },
  );
});

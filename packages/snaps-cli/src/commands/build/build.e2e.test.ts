import { getCommandRunner, SNAP_BROWSERIFY_DIR } from '../../test-utils';

describe('mm-snap build', () => {
  it.each(['build', 'b'])(
    'builds a snap using "mm-snap %s"',
    async (command) => {
      const runner = getCommandRunner(command, []);
      await runner.wait();

      expect(runner.exitCode).toBe(0);
      expect(runner.stderr).toStrictEqual([]);
      expect(runner.stdout[0]).toMatch(/Checking the input file\./u);
      expect(runner.stdout[1]).toMatch(/Building the snap bundle\./u);
      expect(runner.stdout[2]).toMatch(/Compiled \d+ files in \d+ms\./u);
      expect(runner.stdout[3]).toMatch(/Evaluating the snap bundle\./u);
    },
  );

  it.each(['build', 'b'])(
    'builds a snap using "mm-snap %s" using a legacy config',
    async (command) => {
      const runner = getCommandRunner(command, [], SNAP_BROWSERIFY_DIR);
      await runner.wait();

      expect(runner.exitCode).toBe(0);
      expect(runner.stderr).toStrictEqual([]);
      expect(runner.stdout[0]).toMatch(/Checking the input file\./u);
      expect(runner.stdout[1]).toMatch(/Building the snap bundle\./u);
      expect(runner.stdout[2]).toMatch(/Compiled \d+ files in \d+ms\./u);
      expect(runner.stdout[3]).toMatch(/Evaluating the snap bundle\./u);
    },
  );
});

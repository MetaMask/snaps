import { getCommandRunner, TestRunner } from '../../test-utils';

describe('mm-snap manifest', () => {
  let runner: TestRunner;

  afterEach(() => {
    runner?.kill();
  });

  it.each(['manifest', 'm'])(
    'validates the manifest using "mm-snap %s"',
    async (command) => {
      runner = getCommandRunner(command, []);
      await runner.wait();

      expect(runner.stderr).toStrictEqual([]);
      expect(runner.stdout[0]).toMatch(/Checking the input file\./u);
      expect(runner.stdout[1]).toMatch(/Validating the snap manifest\./u);
      expect(runner.stdout[2]).toMatch(/The snap manifest file is valid\./u);
      expect(runner.exitCode).toBe(0);
    },
  );
});

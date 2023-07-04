import { getCommandRunner } from '../../test-utils';

describe('mm-snap manifest', () => {
  it.each(['manifest', 'm'])(
    'validates the manifest using "mm-snap %s"',
    async (command) => {
      const runner = getCommandRunner(command, []);
      await runner.wait();

      expect(runner.exitCode).toBe(0);
      expect(runner.stderr).toStrictEqual([]);
      expect(runner.stdout[0]).toMatch(/Checking the input file\./u);
      expect(runner.stdout[1]).toMatch(/Validating the snap manifest\./u);
      expect(runner.stdout[2]).toMatch(/The snap manifest file is valid\./u);
    },
  );
});

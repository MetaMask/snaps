import type { TestRunner } from '../../test-utils';
import { getCommandRunner } from '../../test-utils';

describe('mm-snap build', () => {
  let runner: TestRunner;

  afterEach(async () => {
    runner?.kill();
  });

  it.each(['build', 'b'])(
    'builds a snap using "mm-snap %s"',
    async (command) => {
      runner = getCommandRunner(command, []);
      await runner.wait();

      expect(runner.stdout).toContainEqual(
        expect.stringMatching(/Checking the input file\./u),
      );
      expect(runner.stdout).toContainEqual(
        expect.stringMatching(/Building the Snap bundle\./u),
      );

      expect(runner.stdout).toContainEqual(
        expect.stringMatching(/Compiled \d+ files? in \d+ms\./u),
      );
      expect(runner.stdout).toContainEqual(
        expect.stringContaining(
          'No icon found in the Snap manifest. It is recommended to include an icon for the Snap. See https://docs.metamask.io/snaps/how-to/design-a-snap/#guidelines-at-a-glance for more information.',
        ),
      );
      expect(runner.stdout).toContainEqual(
        expect.stringMatching(/Evaluating the Snap bundle\./u),
      );
      expect(runner.exitCode).toBe(0);
    },
  );
});

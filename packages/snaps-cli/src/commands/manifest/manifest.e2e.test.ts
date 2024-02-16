import type { TestRunner } from '../../test-utils';
import { getCommandRunner } from '../../test-utils';

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

      expect(runner.stdout).toContainEqual(
        expect.stringMatching(/Checking the input file\./u),
      );
      expect(runner.stdout).toContainEqual(
        expect.stringMatching(/Validating the snap manifest\./u),
      );
      expect(runner.stderr).toContainEqual(
        expect.stringMatching(/The snap manifest file has warnings\./u),
      );
      expect(runner.stderr).toContainEqual(
        expect.stringContaining(
          'No icon found in the Snap manifest. It is recommended to include an icon for the Snap. See https://docs.metamask.io/snaps/how-to/design-a-snap/#guidelines-at-a-glance for more information.',
        ),
      );
      expect(runner.exitCode).toBe(0);
    },
  );
});

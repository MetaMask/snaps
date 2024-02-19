import { promises as fs } from 'fs';
import { join } from 'path';

import type { TestRunner } from '../../test-utils';
import { getCommandRunner, SNAP_BROWSERIFY_DIR } from '../../test-utils';

describe('mm-snap build', () => {
  let runner: TestRunner;
  let originalManifest: string;

  beforeEach(async () => {
    // Since this is an end-to-end test, and we're working with a "real" snap,
    // we have to make a copy of the original snap manifest, so we can modify it
    // and reset it after the test.
    originalManifest = await fs.readFile(
      join(SNAP_BROWSERIFY_DIR, 'snap.manifest.json'),
      'utf-8',
    );
  });

  afterEach(async () => {
    runner?.kill();
    await fs.writeFile(
      join(SNAP_BROWSERIFY_DIR, 'snap.manifest.json'),
      originalManifest,
    );
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
        expect.stringMatching(/Building the snap bundle\./u),
      );
      expect(runner.stderr).toContainEqual(
        expect.stringMatching(
          /Compiled \d+ files? in \d+ms with \d+ warnings?\./u,
        ),
      );
      expect(runner.stderr).toContainEqual(
        expect.stringContaining(
          'No icon found in the Snap manifest. It is recommended to include an icon for the Snap. See https://docs.metamask.io/snaps/how-to/design-a-snap/#guidelines-at-a-glance for more information.',
        ),
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

      expect(runner.stdout).toContainEqual(
        expect.stringMatching(/Checking the input file\./u),
      );
      expect(runner.stdout).toContainEqual(
        expect.stringMatching(/Building the snap bundle\./u),
      );
      expect(runner.stderr).toContainEqual(
        expect.stringMatching(
          /Compiled \d+ files? in \d+ms with \d+ warnings?\./u,
        ),
      );
      expect(runner.stderr).toContainEqual(
        expect.stringContaining(
          'No icon found in the Snap manifest. It is recommended to include an icon for the Snap. See https://docs.metamask.io/snaps/how-to/design-a-snap/#guidelines-at-a-glance for more information.',
        ),
      );
      expect(runner.stdout).toContainEqual(
        expect.stringMatching(/Evaluating the snap bundle\./u),
      );
      expect(runner.exitCode).toBe(0);
    },
  );
});

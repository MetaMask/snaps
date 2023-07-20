import { promises as fs } from 'fs';
import { resolve } from 'path';

import type { TestRunner } from '../../test-utils';
import { getCommandRunner, SNAP_DIR } from '../../test-utils';

describe('mm-snap watch', () => {
  const SNAP_FILE = resolve(SNAP_DIR, 'src/index.ts');
  let originalFile: string;
  let runner: TestRunner;

  beforeEach(async () => {
    // Since this is an end-to-end test, and we're working with a "real" snap,
    // we have to make a copy of the original snap file, so we can modify it
    // and reset it after the test.
    originalFile = await fs.readFile(SNAP_FILE, 'utf-8');
  });

  afterEach(async () => {
    runner?.kill();
    await fs.writeFile(SNAP_FILE, originalFile);
  });

  it.each(['watch', 'w'])(
    'builds and watches for changes using "mm-snap %s"',
    async (command) => {
      runner = getCommandRunner(command, ['--port', '0']);
      await runner.waitForStdout(/Compiled \d+ files? in \d+ms\./u);

      await fs.writeFile(SNAP_FILE, originalFile);
      await runner.waitForStdout(/Changes detected in .+, recompiling\./u);
      await runner.waitForStdout(/Compiled \d+ files? in \d+ms\./u);

      expect(runner.stderr).toStrictEqual([]);
      expect(runner.stdout).toContainEqual(
        expect.stringMatching(/Checking the input file\./u),
      );
      expect(runner.stdout).toContainEqual(
        expect.stringMatching(/Starting the development server\./u),
      );
      expect(runner.stdout).toContainEqual(
        expect.stringMatching(
          /The server is listening on http:\/\/localhost:\d+\./u,
        ),
      );
      expect(runner.stdout).toContainEqual(
        expect.stringMatching(/Building the snap bundle\./u),
      );
      expect(runner.stdout).toContainEqual(
        expect.stringMatching(/Compiled \d+ files? in \d+ms\./u),
      );
      expect(runner.stdout).toContainEqual(
        expect.stringMatching(/Changes detected in .+, recompiling\./u),
      );
    },
  );
});

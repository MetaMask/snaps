import { LogLevel } from 'clet';
import { promises as fs } from 'fs';
import { tmpdir } from 'os';
import { resolve } from 'path';

import { run } from '../../test-utils';

jest.unmock('fs');
jest.setTimeout(30000);

const TMP_DIR = resolve(tmpdir(), 'metamask-snaps-test');

describe('mm-snap init', () => {
  it.each(['init', 'i'])(
    'initializes a new snap using "mm-snap %s"',
    async (command) => {
      expect.assertions(1);

      const initPath = resolve(TMP_DIR, command);
      await fs.rm(initPath, { force: true, recursive: true });
      await fs.mkdir(TMP_DIR, { recursive: true });

      await run({
        command,
        options: [initPath],
      })
        .debug(LogLevel.INFO)
        .wait('stdout', `Preparing ${initPath}...`)
        .wait('stdout', 'Cloning template...')
        .wait('stdout', 'Installing dependencies...')
        .wait('stdout', 'Initializing git repository...')
        .wait(
          'stdout',
          "Build success: 'src/index.ts' bundled as 'dist/bundle.js'!",
        )
        .wait('stdout', "Eval Success: evaluated 'dist/bundle.js' in SES!")
        .wait('stdout', 'Snap project successfully initiated!')
        .tap(async () => {
          const file = await fs.readFile(resolve(initPath, 'package.json'));
          expect(file).toBeDefined();
        })
        .kill()
        .end();
    },
  );
});

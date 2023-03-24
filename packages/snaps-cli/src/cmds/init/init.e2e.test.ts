import { promises as fs } from 'fs';
import { tmpdir } from 'os';
import { resolve } from 'path';

import { run } from '../../test-utils';

jest.unmock('fs');

const TMP_DIR = resolve(tmpdir(), 'metamask-snaps-test');

describe('mm-snap init', () => {
  it.each(['init', 'i'])(
    'initializes a new snap using "mm-snap %s"',
    async (command) => {
      const initPath = resolve(TMP_DIR, command);
      await fs.rm(initPath, { force: true, recursive: true });
      await fs.mkdir(TMP_DIR, { recursive: true });

      await run({
        command,
        options: [initPath],
      })
        .stdout(/Preparing .*\.\.\./u)
        .stdout('Cloning template...')
        .stdout('Installing dependencies...')
        .stdout('Initializing git repository...')
        .stdout(/Build success: '.*' bundled as '.*'!/u)
        .stdout(/Eval Success: evaluated '.*' in SES!/u)
        .wait('stdout', 'Snap project successfully initiated!')
        .kill()
        .end();
    },
  );
});

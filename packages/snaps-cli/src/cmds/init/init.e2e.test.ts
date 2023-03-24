import { promises as fs } from 'fs';
import { tmpdir } from 'os';
import { resolve } from 'path';

import { run } from '../../test-utils';

jest.unmock('fs');

const TMP_DIR = resolve(tmpdir(), 'metamask-snaps-test');

describe('mm-snap init', () => {
  // TODO: Enable this test. Currently installing dependencies takes too long,
  // and we don't want to increase the timeout even more. We should consider
  // making a minimal template for testing purposes, and adding a way to specify
  // the template to use.
  it.skip.each(['init', 'i'])(
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

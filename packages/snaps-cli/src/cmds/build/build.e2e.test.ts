import { join } from 'path';

import { run, SNAP_DIR } from '../../test-utils';

describe('mm-snap build', () => {
  it.each(['build', 'b'])(
    'builds a snap using "mm-snap %s"',
    async (command) => {
      await run({ command })
        .stdout(/Build success: '.*' bundled as '.*'!/u)
        .stdout(/Eval Success: evaluated '.*' in SES!/u)
        .end();
    },
  );

  it('supports setting a bundle and output file', async () => {
    await run({
      command: 'build',
      options: [
        '--src',
        join(SNAP_DIR, 'src/index.js'),
        '--dist',
        join(SNAP_DIR, 'dist'),
        '--manifest',
        'false',
        '--writeManifest',
        'false',
      ],
      workingDirectory: '.',
    })
      .stdout(/Build success: '.*' bundled as '.*'!/u)
      .stdout(/Eval Success: evaluated '.*' in SES!/u)
      .end();
  });

  it('does not eval when set to false', async () => {
    await run({ command: 'build', options: ['--eval', 'false'] })
      .stdout(/Build success: '.*' bundled as '.*'!/u)
      .notStdout(/Eval Success: evaluated '.*' in SES!/u)
      .end();
  });

  it('logs an error when the input file does not exist', async () => {
    await run({ command: 'build', options: ['--src', 'foo.js'] })
      .stderr(
        "Error: Invalid params: 'foo.js' is not a file or does not exist.",
      )
      .code(1)
      .end();
  });
});

import { join } from 'path';

import { run, SNAP_DIR } from '../../test-utils';

describe('mm-snap build', () => {
  it.each(['build', 'b'])(
    'builds a snap using "mm-snap %s"',
    async (command) => {
      await run({ command })
        .stdout("Build success: 'src/index.ts' bundled as 'dist/bundle.js'!")
        .stdout("Eval Success: evaluated 'dist/bundle.js' in SES!")
        .kill()
        .end();
    },
  );

  it('supports setting a bundle and output file', async () => {
    await run({
      command: 'build',
      options: [
        `--src ${join(SNAP_DIR, 'src/index.ts')}`,
        `--dist ${join(SNAP_DIR, 'dist')}`,
        `--manifest false`,
        `--writeManifest false`,
      ],
      workingDirectory: '.',
    })
      .stdout(
        "Build success: '../examples/examples/typescript/src/index.ts' bundled as '../examples/examples/typescript/dist/bundle.js'!",
      )
      .stdout(
        "Eval Success: evaluated '../examples/examples/typescript/dist/bundle.js' in SES!",
      )
      .kill()
      .end();
  });

  it('does not eval when set to false', async () => {
    await run({ command: 'build', options: ['--eval false'] })
      .stdout("Build success: 'src/index.ts' bundled as 'dist/bundle.js'!")
      .notStdout("Eval Success: evaluated 'dist/bundle.js' in SES!")
      .kill()
      .end();
  });

  it('logs an error when the input file does not exist', async () => {
    await run({ command: 'build', options: ['--src foo.js'] })
      .stderr(
        "Error: Invalid params: 'foo.js' is not a file or does not exist.",
      )
      .code(1)
      .kill()
      .end();
  });
});

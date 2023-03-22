import { LogLevel } from 'clet';
import { promises as fs } from 'fs';
import { join } from 'path';

import { run, SNAP_DIR } from '../../test-utils';

jest.unmock('fs');

describe('mm-snap watch', () => {
  it.each(['manifest', 'm'])(
    'validates the manifest using "mm-snap %s"',
    async (command) => {
      await run({
        command,
        options: ['--serve false'],
      })
        .wait('stdout', "Watching 'src/' for changes...")
        .wait(
          'stdout',
          "Build success: 'src/index.ts' bundled as 'dist/bundle.js'!",
        )
        .wait('stdout', "Eval Success: evaluated 'dist/bundle.js' in SES!")
        .kill()
        .end();
    },
  );

  it('logs manifest errors', async () => {
    // Write something to the bundle, so that the shasum doesn't match.
    await fs.writeFile(join(SNAP_DIR, 'dist/bundle.js'), '// Hello, world!');

    await run({
      command: 'manifest',
      options: ['--fix false'],
    })
      .debug(LogLevel.INFO)
      .stderr('Manifest Error: The manifest is invalid.')
      .stderr(
        'Manifest Error: "snap.manifest.json" "shasum" field does not match computed shasum.',
      )
      .code(1)
      .end();
  });

  it('fixes manifest errors', async () => {
    // Write something to the bundle, so that the shasum doesn't match.
    await fs.mkdir(join(SNAP_DIR, 'dist'), { recursive: true });
    await fs.writeFile(join(SNAP_DIR, 'dist/bundle.js'), '// Hello, world!');

    // Since this is an end-to-end test, and we're working with a "real" snap,
    // we have to make a copy of the original snap file, so we can modify it and
    // reset it after the test.
    const filePath = join(SNAP_DIR, 'snap.manifest.json');
    const originalFile = await fs.readFile(filePath, 'utf-8');

    await run({
      command: 'manifest',
      options: ['--fix true'],
    })
      .debug(LogLevel.INFO)
      .code(0)
      .end();

    const manifest = await fs.readFile(filePath, 'utf-8').then(JSON.parse);

    expect(manifest.source.shasum).toBe(
      'SKqZnDaIdSkxTrAKJrEw6W1OnVzNdpsM9aleK9DTuTk=',
    );

    await fs.writeFile(filePath, originalFile, 'utf-8');
  });
});

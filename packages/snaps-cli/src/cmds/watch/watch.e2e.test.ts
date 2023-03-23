import fetch from 'cross-fetch';
import { promises as fs } from 'fs';
import { join } from 'path';

import { run, SNAP_DIR } from '../../test-utils';

describe('mm-snap watch', () => {
  it.each(['watch', 'w'])(
    'builds and watches for changes using "mm-snap %s"',
    async (command) => {
      await run({
        command,
        options: ['--serve false'],
      })
        .wait('stdout', "Watching 'src/' for changes...")
        .wait(
          'stdout',
          `Build success: '${join('src', 'index.ts')}' bundled as '${join(
            'dist',
            'bundle.js',
          )}'!`,
        )
        .wait(
          'stdout',
          `Eval Success: evaluated '${join('dist', 'bundle.js')}' in SES!`,
        )
        .kill()
        .end();
    },
  );

  it('rebuilds after a change', async () => {
    // Since this is an end-to-end test, and we're working with a "real" snap,
    // we have to make a copy of the original snap file, so we can modify it and
    // reset it after the test.
    const filePath = join(SNAP_DIR, 'src/index.ts');
    const originalFile = await fs.readFile(filePath, 'utf-8');

    await run({
      command: 'watch',
      options: ['--serve false'],
    })
      .wait('stdout', "Watching 'src/' for changes...")
      .wait(
        'stdout',
        `Build success: '${join('src', 'index.ts')}' bundled as '${join(
          'dist',
          'bundle.js',
        )}'!`,
      )
      .wait(
        'stdout',
        `Eval Success: evaluated '${join('dist', 'bundle.js')}' in SES!`,
      )
      .tap(async () => {
        await fs.writeFile(
          filePath,
          `${originalFile}\nconsole.log("This should show up during eval.");`,
          'utf-8',
        );
      })
      .wait(
        'stdout',
        `Build success: '${join('src', 'index.ts')}' bundled as '${join(
          'dist',
          'bundle.js',
        )}'!`,
      )
      .wait('stdout', 'This should show up during eval.')
      .wait(
        'stdout',
        `Eval Success: evaluated '${join('dist', 'bundle.js')}' in SES!`,
      )
      .kill()
      .end();

    await fs.writeFile(filePath, originalFile, 'utf-8');
  });

  it('serves the snap by default', async () => {
    await run({
      command: 'watch',
      options: ['--port 8088'],
    })
      .wait('stdout', "Watching 'src/' for changes...")
      .wait(
        'stdout',
        `Build success: '${join('src', 'index.ts')}' bundled as '${join(
          'dist',
          'bundle.js',
        )}'!`,
      )
      .wait(
        'stdout',
        `Eval Success: evaluated '${join('dist', 'bundle.js')}' in SES!`,
      )
      .wait('stdout', 'Starting server...')
      .wait('stdout', `Server listening on: http://localhost:8088`)
      .tap(async () => {
        const response = await fetch(`http://localhost:8088`);
        expect(response.ok).toBe(true);
      })
      .kill()
      .end();
  });
});

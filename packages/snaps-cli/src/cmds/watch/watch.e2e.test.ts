import fetch from 'cross-fetch';
import { promises as fs } from 'fs';
import { join } from 'path';

import { kill, run, SNAP_DIR } from '../../test-utils';

describe('mm-snap watch', () => {
  it.each(['watch', 'w'])(
    'builds and watches for changes using "mm-snap %s"',
    async (command) => {
      const runner = run({
        command,
        options: ['--serve false'],
      })
        .stdout("Watching 'src/' for changes...")
        .stdout(
          `Build success: '${join('src', 'index.ts')}' bundled as '${join(
            'dist',
            'bundle.js',
          )}'!`,
        )
        .stdout(
          `Eval Success: evaluated '${join('dist', 'bundle.js')}' in SES!`,
        )
        .kill();

      await runner.end();
      kill(runner);
    },
  );

  it('rebuilds after a change', async () => {
    // Since this is an end-to-end test, and we're working with a "real" snap,
    // we have to make a copy of the original snap file, so we can modify it and
    // reset it after the test.
    const filePath = join(SNAP_DIR, 'src/index.ts');
    const originalFile = await fs.readFile(filePath, 'utf-8');

    const runner = run({
      command: 'watch',
      options: ['--serve false'],
    })
      .stdout("Watching 'src/' for changes...")
      .stdout(
        `Build success: '${join('src', 'index.ts')}' bundled as '${join(
          'dist',
          'bundle.js',
        )}'!`,
      )
      .stdout(`Eval Success: evaluated '${join('dist', 'bundle.js')}' in SES!`)
      .tap(async () => {
        await fs.writeFile(
          filePath,
          `${originalFile}\nconsole.log("This should show up during eval.");`,
          'utf-8',
        );
      })
      .stdout(
        `Build success: '${join('src', 'index.ts')}' bundled as '${join(
          'dist',
          'bundle.js',
        )}'!`,
      )
      .stdout('This should show up during eval.')
      .stdout(`Eval Success: evaluated '${join('dist', 'bundle.js')}' in SES!`)
      .kill();

    await runner.end();
    kill(runner);

    await fs.writeFile(filePath, originalFile, 'utf-8');
  });

  it('serves the snap by default', async () => {
    const runner = run({
      command: 'watch',
      options: ['--port 8088'],
    })
      .stdout("Watching 'src/' for changes...")
      .stdout(
        `Build success: '${join('src', 'index.ts')}' bundled as '${join(
          'dist',
          'bundle.js',
        )}'!`,
      )
      .stdout(`Eval Success: evaluated '${join('dist', 'bundle.js')}' in SES!`)
      .stdout('Starting server...')
      .stdout(`Server listening on: http://localhost:8088`)
      .tap(async () => {
        const response = await fetch(`http://localhost:8088`);
        expect(response.ok).toBe(true);
      })
      .kill();

    await runner.end();
    kill(runner);
  });
});

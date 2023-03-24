import { run } from '@metamask/snaps-cli/test-utils';
import { join } from 'path';

describe('mm-snap eval', () => {
  it.skip.each(['eval', 'e'])(
    'evaluates a snap using "mm-snap %s"',
    async (command) => {
      await run({
        command,
        options: [`--bundle ${join('__test__', 'eval.js')}`],
        workingDirectory: __dirname,
      })
        .stdout(
          `Eval Success: evaluated '${join('__test__', 'eval.js')}' in SES!`,
        )
        .kill()
        .end();
    },
  );

  it('shows a message if the evaluation failed', async () => {
    const runner = run({
      command: 'eval',
      options: [`--bundle ${join('__test__', 'eval-2.js')}`],
      workingDirectory: __dirname,
    })
      .stderr('Eval failed.')
      .code(1)
      .kill();

    await runner.end();

    console.log('Runner connected:', runner.proc.connected);
    console.log('Runner killed:', runner.proc.killed);

    if (!runner.proc.killed) {
      console.log('Killing runner...');
      runner.proc.kill();
    }

    runner.proc.unref();
  });
});

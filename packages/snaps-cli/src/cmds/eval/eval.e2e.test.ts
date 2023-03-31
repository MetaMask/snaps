import { run } from '@metamask/snaps-cli/test-utils';
import { join } from 'path';

describe('mm-snap eval', () => {
  it.each(['eval', 'e'])(
    'evaluates a snap using "mm-snap %s"',
    async (command) => {
      await run({
        command,
        options: ['--bundle', join('__test__', 'eval.js')],
        workingDirectory: __dirname,
      })
        .stdout(/Eval Success: evaluated '.*' in SES!/u)
        .end();
    },
  );

  it('shows a message if the evaluation failed', async () => {
    await run({
      command: 'eval',
      options: ['--bundle', join('__test__', 'eval-2.js')],
      workingDirectory: __dirname,
    })
      .stderr('Eval failed.')
      .code(1)
      .end();
  });
});

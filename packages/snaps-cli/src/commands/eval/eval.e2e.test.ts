import { run } from '@metamask/snaps-cli/test-utils';
import { resolve } from 'path';

describe('mm-snap eval', () => {
  describe('webpack', () => {
    it.each(['eval', 'e'])(
      'evaluates a snap using "mm-snap %s"',
      async (command) => {
        await run({
          command,
          workingDirectory: resolve(__dirname, '__test__', 'webpack', 'good'),
        })
          .stdout(/Snap bundle ".*" successfully evaluated in SES\./u)
          .end();
      },
    );

    it('shows a message if the evaluation failed', async () => {
      await run({
        command: 'eval',
        workingDirectory: resolve(__dirname, '__test__', 'webpack', 'bad'),
      })
        .stderr('Eval failed.')
        .stderr(
          /Failed to evaluate snap bundle ".*" in SES: Process exited with non-zero exit code: 255/u,
        )
        .code(1)
        .end();
    });
  });

  describe('browserify', () => {
    it.each(['eval', 'e'])(
      'evaluates a snap using "mm-snap %s"',
      async (command) => {
        await run({
          command,
          workingDirectory: resolve(
            __dirname,
            '__test__',
            'browserify',
            'good',
          ),
        })
          .stdout(/Snap bundle ".*" successfully evaluated in SES\./u)
          .end();
      },
    );

    it('shows a message if the evaluation failed', async () => {
      await run({
        command: 'eval',
        workingDirectory: resolve(__dirname, '__test__', 'browserify', 'bad'),
      })
        .stderr('Eval failed.')
        .stderr(
          /Failed to evaluate snap bundle ".*" in SES: Process exited with non-zero exit code: 255/u,
        )
        .code(1)
        .end();
    });
  });
});

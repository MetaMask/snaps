import { getCommandRunner } from '@metamask/snaps-cli/test-utils';
import { resolve } from 'path';

describe('mm-snap eval', () => {
  it.each([
    {
      command: 'eval',
      bundler: 'webpack',
    },
    {
      command: 'e',
      bundler: 'webpack',
    },
    {
      command: 'eval',
      bundler: 'browserify',
    },
    {
      command: 'e',
      bundler: 'browserify',
    },
  ])(
    'evaluates a $bundler snap using "mm-snap $command"',
    async ({ command, bundler }) => {
      const runner = getCommandRunner(
        command,
        [],
        resolve(__dirname, '__test__', bundler, 'good'),
      );

      await runner.wait();

      expect(runner.exitCode).toBe(0);
      expect(runner.stderr).toStrictEqual([]);
      expect(runner.stdout[0]).toMatch(/Checking the input file\./u);
      expect(runner.stdout[1]).toMatch(/Evaluating the snap bundle\./u);
      expect(runner.stdout[2]).toMatch(/Successfully evaluated snap bundle\./u);
    },
  );

  it.each(['eval', 'e'])(
    'evaluates a snap using "mm-snap %s --input eval.js"',
    async (command) => {
      const runner = getCommandRunner(
        command,
        ['--input', 'good/eval.js'],
        resolve(__dirname, '__test__', 'webpack'),
      );

      await runner.wait();

      expect(runner.exitCode).toBe(0);
      expect(runner.stderr).toStrictEqual([]);
      expect(runner.stdout[0]).toMatch(/Checking the input file\./u);
      expect(runner.stdout[1]).toMatch(/Evaluating the snap bundle\./u);
      expect(runner.stdout[2]).toMatch(/Successfully evaluated snap bundle\./u);
    },
  );

  it.each(['eval', 'e'])(
    'evaluates a snap using "mm-snap %s -i eval.js"',
    async (command) => {
      const runner = getCommandRunner(
        command,
        ['-i', 'good/eval.js'],
        resolve(__dirname, '__test__', 'webpack'),
      );

      await runner.wait();

      expect(runner.exitCode).toBe(0);
      expect(runner.stderr).toStrictEqual([]);
      expect(runner.stdout[0]).toMatch(/Checking the input file\./u);
      expect(runner.stdout[1]).toMatch(/Evaluating the snap bundle\./u);
      expect(runner.stdout[2]).toMatch(/Successfully evaluated snap bundle\./u);
    },
  );

  it('shows a message if the evaluation failed', async () => {
    const runner = getCommandRunner(
      'eval',
      [],
      resolve(__dirname, '__test__', 'webpack', 'bad'),
    );

    await runner.wait();

    expect(runner.exitCode).toBe(1);
    expect(runner.stdout[0]).toMatch(/Checking the input file\./u);
    expect(runner.stdout[1]).toMatch(/Evaluating the snap bundle\./u);
    expect(runner.stderr[0]).toMatch(
      /Failed to evaluate snap bundle in SES\. This is likely due to an incompatibility with the SES environment in your snap\./u,
    );
  });
});

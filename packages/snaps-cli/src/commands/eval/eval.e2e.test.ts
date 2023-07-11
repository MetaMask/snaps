import { getCommandRunner, TestRunner } from '@metamask/snaps-cli/test-utils';
import { resolve } from 'path';

describe('mm-snap eval', () => {
  let runner: TestRunner;

  afterEach(() => {
    runner?.kill();
  });

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
      runner = getCommandRunner(
        command,
        [],
        resolve(__dirname, '__test__', bundler, 'good'),
      );

      await runner.wait();

      expect(runner.stderr).toStrictEqual([]);
      expect(runner.stdout[0]).toMatch(/Checking the input file\./u);
      expect(runner.stdout[1]).toMatch(/Evaluating the snap bundle\./u);
      expect(runner.stdout[2]).toMatch(/Successfully evaluated snap bundle\./u);
      expect(runner.exitCode).toBe(0);
    },
  );

  it.each(['eval', 'e'])(
    'evaluates a snap using "mm-snap %s --input eval.js"',
    async (command) => {
      runner = getCommandRunner(
        command,
        ['--input', 'good/eval.js'],
        resolve(__dirname, '__test__', 'webpack'),
      );

      await runner.wait();

      expect(runner.stderr).toStrictEqual([]);
      expect(runner.stdout[0]).toMatch(/Checking the input file\./u);
      expect(runner.stdout[1]).toMatch(/Evaluating the snap bundle\./u);
      expect(runner.stdout[2]).toMatch(/Successfully evaluated snap bundle\./u);
      expect(runner.exitCode).toBe(0);
    },
  );

  it.each(['eval', 'e'])(
    'evaluates a snap using "mm-snap %s -i eval.js"',
    async (command) => {
      runner = getCommandRunner(
        command,
        ['-i', 'good/eval.js'],
        resolve(__dirname, '__test__', 'webpack'),
      );

      await runner.wait();

      expect(runner.stderr).toStrictEqual([]);
      expect(runner.stdout[0]).toMatch(/Checking the input file\./u);
      expect(runner.stdout[1]).toMatch(/Evaluating the snap bundle\./u);
      expect(runner.stdout[2]).toMatch(/Successfully evaluated snap bundle\./u);
      expect(runner.exitCode).toBe(0);
    },
  );

  it('shows a message if the evaluation failed', async () => {
    runner = getCommandRunner(
      'eval',
      [],
      resolve(__dirname, '__test__', 'webpack', 'bad'),
    );

    await runner.wait();

    expect(runner.stdout[0]).toMatch(/Checking the input file\./u);
    expect(runner.stdout[1]).toMatch(/Evaluating the snap bundle\./u);
    expect(runner.stderr[0]).toMatch(
      /Failed to evaluate snap bundle in SES\. This is likely due to an incompatibility with the SES environment in your snap\./u,
    );
    expect(runner.exitCode).toBe(1);
  });
});

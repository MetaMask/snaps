import { logInfo } from '@metamask/snaps-utils';
import chalk from 'chalk';
import ora from 'ora';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import { Environment, environments } from './environments';

type BenchmarkOptions = {
  snaps: number;
  iterations: number;
  requests: number;
  environment: Environment;
};

/**
 * The main CLI entry point function. This processes the command line args, and
 * runs the appropriate function.
 */
export async function main() {
  const argv = await yargs(hideBin(process.argv))
    .command('$0', 'Run the benchmarks')
    .example(
      '$0 --environment iframe --snaps 5 --iterations 100',
      'Run 5 snaps 100 times, using the iframe-execution-environment',
    )
    .option('environment', {
      alias: 'e',
      default: Environment.Iframe,
      description: 'The Snaps execution environment to use',
      choices: Object.values(Environment),
    })
    .option('iterations', {
      alias: 'i',
      type: 'number',
      default: 5,
      description: 'Number of iterations to run',
    })
    .option('snaps', {
      alias: 's',
      type: 'number',
      default: 5,
      description: 'Number of snaps to run at the same time',
    })
    .option('requests', {
      alias: 'r',
      type: 'number',
      default: 5,
      description: 'Number of requests to send to each snap',
    })
    .parse();

  return await benchmark(argv);
}

/**
 * Run the benchmarks.
 *
 * @param options - Options.
 * @param options.iterations - Number of iterations to run.
 * @param options.snaps - Number of snaps to run at the same time.
 * @param options.requests - Number of requests to send to each snap.
 * @param options.environment - The Snaps execution environment to use.
 * @returns The benchmark results.
 */
export async function benchmark({
  iterations,
  snaps,
  requests,
  environment,
}: BenchmarkOptions) {
  const spinner = ora('Running benchmarks.').start();

  const runEnvironments =
    environment === Environment.All
      ? Object.values(Environment).filter((env) => env !== Environment.All)
      : [environment];

  const results = await Promise.all(
    runEnvironments.map(
      async (currentEnvironment) =>
        await run({
          iterations,
          snaps,
          requests,
          environment: currentEnvironment,
        }),
    ),
  );

  spinner.succeed('Benchmarks complete.');

  logInfo('');
  logInfo(`${chalk.bold('Settings')}:`);
  logInfo(formatSettings('Snaps', snaps));
  logInfo(formatSettings('Requests', requests));
  logInfo(formatSettings('Iterations', iterations));

  results.forEach((result) => {
    logInfo('');
    logInfo(`${chalk.bold('Results')} (${chalk.dim(result.environment)}):`);
    logInfo(formatResult('Total time', result.total));
    logInfo(formatResult('Average time', result.average));
    logInfo(formatResult('Min time', result.min));
    logInfo(formatResult('Max time', result.max));
  });
}

/**
 * Run the benchmarks.
 *
 * @param options - Options.
 * @param options.iterations - Number of iterations to run.
 * @param options.snaps - Number of snaps to run at the same time.
 * @param options.requests - Number of requests to send to each snap.
 * @param options.environment - The Snaps execution environment to use.
 * @returns The benchmark results.
 */
export async function run({
  iterations,
  snaps,
  requests,
  environment,
}: BenchmarkOptions) {
  const Runner = environments[environment];
  const runner = new Runner({ iterations, snaps, requests });

  await runner.initialize();
  const result = await runner.run();
  await runner.stop();

  return {
    environment,
    ...result,
  };
}

/**
 * Format a setting.
 *
 * @param name - The name of the setting.
 * @param value - The value of the setting.
 * @returns The formatted setting.
 */
export function formatSettings(name: string, value: number) {
  return `  ${chalk.bold(`${name}:`).padEnd(22, ' ')} ${value}`;
}

/**
 * Format a result.
 *
 * @param name - The name of the result.
 * @param result - The result.
 * @returns The formatted result.
 */
export function formatResult(name: string, result: number) {
  return `  ${chalk.bold(`${name}:`).padEnd(22, ' ')} ${result.toFixed(1)}ms`;
}

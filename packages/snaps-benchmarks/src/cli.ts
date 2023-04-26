import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import { Environment, IframeRunner } from './environments';

/**
 * The main CLI entry point function. This processes the command line args, and
 * runs the appropriate function.
 */
export async function main() {
  const { snaps, iterations, environment } = await yargs(hideBin(process.argv))
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
      default: 100,
      description: 'Number of iterations to run',
    })
    .option('snaps', {
      alias: 's',
      type: 'number',
      default: 5,
      description: 'Number of snaps to run at the same time',
    })
    .parse();

  const iframe = new IframeRunner({
    url: 'https://execution.metamask.io/0.15.1/index.html',
  });

  await iframe.initialize();
}

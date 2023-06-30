import { dim } from 'chalk';
import type { Ora } from 'ora';
import createSpinner from 'ora';

import { error } from './logging';

export type Step<Context extends Record<string, unknown>> = {
  name: string;
  task: (context: Context) => Promise<void>;
};

export type Steps<Context extends Record<string, unknown>> = Readonly<
  Step<Context>[]
>;

/**
 * Execute a list of steps in series. Each step receives the context object and
 * a spinner instance.
 *
 * @param steps - The steps to execute.
 * @param context - The context object that will be passed to each step.
 */
export async function executeSteps<Context extends Record<string, unknown>>(
  steps: Steps<Context & { spinner: Ora }>,
  context: Context,
) {
  const spinner = createSpinner();
  spinner.start(dim(steps[0].name));

  try {
    for (const step of steps) {
      spinner.text = dim(step.name);

      await step.task({
        ...context,
        spinner,
      });
    }

    if (spinner.isSpinning) {
      spinner.succeed('Done!');
    }
  } catch (_error) {
    error(_error.message, spinner);
    spinner.stop();
    process.exitCode = 1;
  }
}

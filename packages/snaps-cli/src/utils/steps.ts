import { dim } from 'chalk';
import type { Ora } from 'ora';
import createSpinner from 'ora';

import { getErrorMessage } from './errors';
import { error } from './logging';

export type Step<Context extends Record<string, unknown>> = {
  name: string;
  condition?: (context: Context) => boolean;
  task: (context: Context & { spinner: Ora }) => Promise<void>;
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
  steps: Steps<Context>,
  context: Context,
) {
  const spinner = createSpinner({
    // Ora writes to `process.stderr` by default.
    stream: process.stdout,
  });

  spinner.start();

  try {
    for (const step of steps) {
      // If the step has a condition, and it returns false, we skip the step.
      if (step.condition && !step.condition(context)) {
        continue;
      }

      // Calling `start` here instead of setting `spinner.text` seems to work
      // better when the process doesn't have a TTY.
      spinner.start(dim(step.name));

      await step.task({
        ...context,
        spinner,
      });
    }

    // The spinner may have been stopped by a step, so we only succeed if it's
    // still spinning.
    if (spinner.isSpinning) {
      spinner.succeed('Done!');
    }
  } catch (_error) {
    error(getErrorMessage(_error), spinner);
    spinner.stop();
    process.exitCode = 1;
  }
}

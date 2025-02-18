import { dim } from 'chalk';
import type { Ora } from 'ora';
import createSpinner from 'ora';

import { getErrorMessage } from './errors';
import { error } from './logging';

export type Step<Context extends Record<string, unknown>> = {
  name: string;
  condition?: (context: Context) => boolean;
  task: (context: Context & { spinner: Ora }) => Promise<Context | void>;
};

export type Steps<Context extends Record<string, unknown>> =
  readonly Step<Context>[];

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
    await steps.reduce<Promise<Context>>(async (contextPromise, step) => {
      const currentContext = await contextPromise;

      // If the step has a condition, and it returns false, we skip the step.
      if (step.condition && !step.condition(currentContext)) {
        return currentContext;
      }

      // Calling `start` here instead of setting `spinner.text` seems to work
      // better when the process doesn't have a TTY.
      spinner.start(dim(step.name));

      const newContext = await step.task({
        ...currentContext,
        spinner,
      });

      // If the task returns a new context, we use it. Otherwise, we keep the
      // current context.
      return newContext ?? currentContext;
    }, Promise.resolve(context));

    // The spinner may have been stopped by a step, so we only succeed if it's
    // still spinning.
    if (spinner.isSpinning) {
      spinner.succeed('Done!');
    }
  } catch (_error) {
    error(getErrorMessage(_error), spinner);
    spinner.stop();

    // eslint-disable-next-line require-atomic-updates
    process.exitCode = 1;
  }
}

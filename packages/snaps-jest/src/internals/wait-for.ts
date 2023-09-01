import type { HandlerType } from '@metamask/snaps-utils';
import { assert, createModuleLogger } from '@metamask/utils';
import { waitFor as waitForPuppeteer } from 'pptr-testing-library';
import type { Page } from 'puppeteer';

import type { SnapResponse } from '../types';
import { rootLogger } from './logger';

export type WaitForOptions = {
  /**
   * The timeout in milliseconds.
   */
  timeout?: number;

  /**
   * The error message to throw if the condition is not met.
   */
  message?: string;
};

const log = createModuleLogger(rootLogger, 'wait-for');

/**
 * Wait for a condition to be true. This is a wrapper around
 * `pptr-testing-library`'s `waitFor` function, with the addition of a custom
 * error message.
 *
 * @param fn - The condition to wait for.
 * @param options - The options.
 * @param options.timeout - The timeout in milliseconds.
 * @param options.message - The error message to throw if the condition is not
 * met.
 * @returns A promise that resolves when the condition is met. The promise
 * resolves to the return value of the condition function.
 */
export async function waitFor<Result>(
  fn: () => Promise<Result>,
  { timeout = 3000, message }: WaitForOptions = {},
) {
  try {
    let result: Result | undefined;

    await waitForPuppeteer(
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      async () => {
        // Puppeteer's `waitFor` function does not support returning a value
        // from the condition function, so we need to use a variable outside
        // the scope of the function.
        result = await fn();
      },
      {
        timeout,
      },
    );

    assert(result !== undefined);
    return result;
  } catch (error) {
    if (message) {
      throw new Error(message);
    }

    throw error;
  }
}

/**
 * Wait for a JSON-RPC response.
 *
 * @param page - The page to wait for the response on.
 * @param type - The type of response to wait for.
 * @returns The JSON-RPC response.
 */
export async function waitForResponse(
  page: Page,
  type:
    | HandlerType.OnTransaction
    | HandlerType.OnRpcRequest
    | HandlerType.OnCronjob,
) {
  log('Waiting for response of type %s.', type);

  return await page.evaluate(async (_type) => {
    return new Promise<SnapResponse['response']>((resolve) => {
      window.__SIMULATOR_API__.dispatch({
        type: `${_type}/clearResponse`,
      });

      const unsubscribe = window.__SIMULATOR_API__.subscribe(() => {
        const state = window.__SIMULATOR_API__.getState();
        const { pending, response } = state[_type];

        if (!pending && response) {
          unsubscribe();

          resolve(response);
        }
      });
    });
  }, type);
}

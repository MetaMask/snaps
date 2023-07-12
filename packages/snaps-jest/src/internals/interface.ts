import { DialogType } from '@metamask/rpc-methods';
import { assert } from '@metamask/utils';
import type { Page } from 'puppeteer';
import { create } from 'superstruct';

import type { SnapInterface, SnapOptions } from '../types';
import { SnapOptionsStruct } from './structs';
import { waitFor } from './wait-for';

/**
 * Get the current snap user interface (i.e., dialog). This will throw an error
 * if the snap does not show a user interface within the timeout.
 *
 * @param page - The page to get the interface from.
 * @param options - The options to use.
 * @param options.timeout - The timeout in milliseconds to use. Defaults to
 * `1000`.
 * @returns The user interface object.
 */
export async function getInterface(
  page: Page,
  options: SnapOptions = {},
): Promise<SnapInterface> {
  const { timeout } = create(options, SnapOptionsStruct);

  const { type, node: content } = await waitFor(
    async () => {
      const ui = await page.evaluate(() => {
        const state = window.__SIMULATOR_API__.getState();
        return state.simulation.ui;
      });

      assert(ui);
      return ui;
    },
    {
      timeout,
      message: 'Timed out waiting for snap interface to be shown.',
    },
  );

  switch (type) {
    case DialogType.Alert:
      return {
        type: 'alert',
        content,

        ok: async () => {
          await page.evaluate(() => {
            window.__SIMULATOR_API__.dispatch({
              type: 'simulation/resolveUserInterface',
              payload: null,
            });
          });
        },
      };

    case DialogType.Confirmation:
      return {
        type: 'confirmation',
        content,

        ok: async () => {
          await page.evaluate(() => {
            window.__SIMULATOR_API__.dispatch({
              type: 'simulation/resolveUserInterface',
              payload: true,
            });
          });
        },

        cancel: async () => {
          await page.evaluate(() => {
            window.__SIMULATOR_API__.dispatch({
              type: 'simulation/resolveUserInterface',
              payload: false,
            });
          });
        },
      };

    case DialogType.Prompt:
      return {
        type: 'prompt',
        content,

        ok: async (value) => {
          await page.evaluate((payload) => {
            window.__SIMULATOR_API__.dispatch({
              type: 'simulation/resolveUserInterface',
              payload,
            });
          }, value);
        },

        cancel: async () => {
          await page.evaluate(() => {
            window.__SIMULATOR_API__.dispatch({
              type: 'simulation/resolveUserInterface',
              payload: null,
            });
          });
        },
      };

    default:
      throw new Error(`Unknown or unsupported dialog type: ${String(type)}.`);
  }
}

/**
 * Get the text of the notifications.
 *
 * @param page - The page to get the notifications from.
 * @param requestId - The ID of the request to get the notifications for.
 * @returns The text of the notifications, in order of appearance.
 */
export async function getNotifications(page: Page, requestId: string) {
  return await page.evaluate((id) => {
    return window.__SIMULATOR_API__.getNotifications(id);
  }, requestId);
}

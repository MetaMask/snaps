import {
  assertIsJsonRpcRequest,
  JsonRpcId,
  JsonRpcParams,
  JsonRpcRequest,
} from '@metamask/utils';
import { WebdriverIOQueries } from '@testing-library/webdriverio';
import { Key } from 'webdriverio';

import { getEnvironment, getResponse } from './internals';

/**
 * Load a snap into the environment.
 *
 * @param path - The path to the snap.
 */
export async function installSnap(path: string): Promise<void> {
  const settings = await getByText('Settings');
  await settings.click();

  const input = await getByTestId('snap-id-input');
  await input.setValue(path);

  const applyConfig = await getByText('Apply config');
  await applyConfig.click();

  const { browser } = getEnvironment();

  await browser.$(`[data-testid="status-ok"]`).waitForExist({
    timeout: 10000,
    timeoutMsg: 'Timed out waiting for snap to install.',
  });
}

type SendRequestOptions = {
  /**
   * The JSON-RPC request ID.
   */
  id?: JsonRpcId;

  /**
   * The JSON-RPC method.
   */
  method: string;

  /**
   * The JSON-RPC params.
   */
  params?: JsonRpcParams;

  /**
   * The origin to send the request from.
   */
  origin?: string;
};

export const sendJsonRpcRequest = async ({
  id = 1,
  method,
  params,
  origin,
}: SendRequestOptions) => {
  const request: JsonRpcRequest = {
    jsonrpc: '2.0',
    id,
    method,
    params,
  };

  assertIsJsonRpcRequest(request);

  if (origin) {
    const originInput = await getByLabelText('Origin');
    await originInput.setValue(origin);
  }

  const requestTab = await getByTestId('tab-request');
  const wrapper = await requestTab.getByTestId('editor-wrapper');
  const textarea = await wrapper.getByRole('textbox');

  // In order for the next few lines to work, the textarea must be interacted
  // with first.
  await textarea.setValue('');

  const { browser } = getEnvironment();

  // TODO: This needs to be platform agnostic. Right now it only works on macOS.
  await browser.keys([Key.Command, 'a']);
  await browser.keys([Key.Backspace]);
  await textarea.setValue(JSON.stringify(request, null, 2));

  const button = await getByTestId('send-request-button');
  await button.click();

  return await getResponse();
};

/**
 * Get the text of the notifications.
 *
 * @returns The text of the notifications, in order of appearance.
 */
export async function getNotifications() {
  const { browser } = getEnvironment();
  await browser.$('.chakra-toast').waitForExist({
    timeout: 500,
  });

  const notifications = await browser.$$('.chakra-toast');
  const notificationsText = await Promise.all(
    notifications.map(async (notification) => await notification.getText()),
  );

  return notificationsText;
}

/**
 * Get an element by its text. This is a wrapper around the `getByText` query
 * from `@testing-library/webdriverio`.
 *
 * @param args - The arguments to pass to the query.
 * @returns The element.
 */
export async function getByText(
  ...args: Parameters<WebdriverIOQueries['getByText']>
): Promise<ReturnType<WebdriverIOQueries['getByText']>> {
  const environment = getEnvironment();
  return environment.queries.getByText(...args);
}

/**
 * Get an element by its label text. This is a wrapper around the
 * `getByLabelText` query from `@testing-library/webdriverio`.
 *
 * @param args - The arguments to pass to the query.
 * @returns The element.
 */
export async function getByLabelText(
  ...args: Parameters<WebdriverIOQueries['getByLabelText']>
): Promise<ReturnType<WebdriverIOQueries['getByLabelText']>> {
  const environment = getEnvironment();
  return environment.queries.getByLabelText(...args);
}

/**
 * Get an element by its test ID. This is a wrapper around the `getByTestId`
 * query from `@testing-library/webdriverio`.
 *
 * @param args - The arguments to pass to the query.
 * @returns The element.
 */
export async function getByTestId(
  ...args: Parameters<WebdriverIOQueries['getByTestId']>
): Promise<ReturnType<WebdriverIOQueries['getByTestId']>> {
  const environment = getEnvironment();
  return environment.queries.getByTestId(...args);
}

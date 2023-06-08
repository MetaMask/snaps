import { Component } from '@metamask/snaps-ui';
import { HandlerType, SnapRpcHookArgs } from '@metamask/snaps-utils';
import { assert, hasProperty, isPlainObject } from '@metamask/utils';
import { getDocument, queries } from 'pptr-testing-library';
import { Page } from 'puppeteer';
import { create } from 'superstruct';

import {
  RequestOptions,
  SnapRequest,
  SnapResponse,
  TransactionOptions,
} from '../types';
import { getInterface, getNotifications } from './interface';
import { TransactionOptionsStruct } from './structs';
import { waitForResponse } from './wait-for';

/**
 * Send a request to the snap.
 *
 * @param page - The page to send the request from.
 * @param args - The request arguments.
 * @returns The request ID.
 */
async function sendRequest(page: Page, args: SnapRpcHookArgs) {
  const document = await getDocument(page);
  const button = await queries.getByTestId(
    document,
    `navigation-${args.handler}`,
  );

  // Navigate to the request handler page.
  await button.click();

  return await page.evaluate((payload) => {
    window.__SIMULATOR_API__.dispatch({
      type: 'simulation/sendRequest',
      payload,
    });

    return window.__SIMULATOR_API__.getRequestId();
  }, args);
}

/**
 * Send a request to the snap.
 *
 * @param page - The page to send the request from.
 * @param options - The request options.
 * @param options.origin - The origin of the request. Defaults to `metamask.io`.
 * @returns The response.
 */
export function request(
  page: Page,
  { origin = 'metamask.io', ...options }: RequestOptions,
) {
  const doRequest = async (): Promise<SnapResponse> => {
    const args: SnapRpcHookArgs = {
      origin,
      handler: HandlerType.OnRpcRequest,
      request: {
        jsonrpc: '2.0',
        id: 1,
        ...options,
      },
    };

    const id = await sendRequest(page, args);

    const response = await waitForResponse(page, HandlerType.OnRpcRequest);
    const notifications = await getNotifications(page, id);

    return { id, response, notifications };
  };

  // This is a bit hacky, but it allows us to add the `getInterface` method
  // to the response promise.
  const response = doRequest() as SnapRequest;

  response.getInterface = async (getInterfaceOptions) => {
    return await getInterface(page, getInterfaceOptions);
  };

  return response;
}

/**
 * Send a transaction to the snap.
 *
 * @param page - The page to send the transaction from.
 * @param options - The transaction options.
 * @returns The response.
 */
export async function sendTransaction(
  page: Page,
  options: Partial<TransactionOptions>,
) {
  const {
    origin: transactionOrigin,
    chainId,
    ...transaction
  } = create(options, TransactionOptionsStruct);

  const args: SnapRpcHookArgs = {
    origin: '',
    handler: HandlerType.OnTransaction,
    request: {
      jsonrpc: '2.0',
      method: '',
      params: {
        chainId,
        transaction,
        transactionOrigin,
      },
    },
  };

  const id = await sendRequest(page, args);

  const response = await waitForResponse(page, HandlerType.OnTransaction);
  if (hasProperty(response, 'error')) {
    return { id, response, notifications: [] };
  }

  assert(isPlainObject(response.result));
  assert(hasProperty(response.result, 'content'));

  return {
    id,
    response,
    notifications: [],
    content: response.result.content as Component,
  };
}

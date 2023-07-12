import type { Component } from '@metamask/snaps-ui';
import type { SnapRpcHookArgs } from '@metamask/snaps-utils';
import { HandlerType } from '@metamask/snaps-utils';
import {
  assert,
  createModuleLogger,
  hasProperty,
  isPlainObject,
} from '@metamask/utils';
import { getDocument, queries } from 'pptr-testing-library';
import type { Page } from 'puppeteer';
import { create } from 'superstruct';

import type {
  CronjobOptions,
  RequestOptions,
  SnapRequest,
  SnapResponse,
  TransactionOptions,
} from '../types';
import { getInterface, getNotifications } from './interface';
import { rootLogger } from './logger';
import { TransactionOptionsStruct } from './structs';
import { waitForResponse } from './wait-for';

const log = createModuleLogger(rootLogger, 'request');

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
 * @param handler - The handler to use. Defaults to `onRpcRequest`.
 * @returns The response.
 */
export function request(
  page: Page,
  { origin = 'metamask.io', ...options }: RequestOptions,
  handler:
    | HandlerType.OnRpcRequest
    | HandlerType.OnCronjob = HandlerType.OnRpcRequest,
) {
  const doRequest = async (): Promise<SnapResponse> => {
    const args: SnapRpcHookArgs = {
      origin,
      handler,
      request: {
        jsonrpc: '2.0',
        id: 1,
        ...options,
      },
    };

    log('Sending request %o', args);

    const promise = waitForResponse(page, handler);
    const id = await sendRequest(page, args);
    const response = await promise;

    log('Received response %o', response);

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

  log('Sending transaction %o', args);

  const promise = waitForResponse(page, HandlerType.OnTransaction);
  const id = await sendRequest(page, args);
  const response = await promise;

  log('Received response %o', response);

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

/**
 * Run a cronjob.
 *
 * @param page - The page to run the cronjob from.
 * @param options - The request options.
 * @returns The response.
 */
export function runCronjob(page: Page, options: CronjobOptions) {
  return request(page, options, HandlerType.OnCronjob);
}

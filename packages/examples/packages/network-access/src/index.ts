import {
  MethodNotFoundError,
  type OnRpcRequestHandler,
} from '@metamask/snaps-sdk';
import { assert } from '@metamask/utils';

import type { FetchParams } from './types';

/**
 * Fetch a JSON file from the provided URL. This uses the standard `fetch`
 * function to get the JSON data. Because of CORS, the server must respond with
 * an `Access-Control-Allow-Origin` header set to either `*` or `null`.
 *
 * Note that `fetch` is only available with the `endowment:network-access`
 * permission.
 *
 * @param url - The URL to fetch the data from. This function assumes that the
 * provided URL is a JSON document.
 * @returns There response as JSON.
 * @throws If the provided URL is not a JSON document.
 */
async function getJson(url: string) {
  const response = await fetch(url);
  return await response.json();
}

/**
 * Handle incoming JSON-RPC requests from the dapp, sent through the
 * `wallet_invokeSnap` method. This handler handles a single method:
 *
 * - `fetch`: Fetch a JSON document from the provided URL. This demonstrates
 * that a snap can make network requests through the `fetch` function. Note that
 * the `endowment:network-access` permission must be enabled for this to work.
 *
 * @param params - The request parameters.
 * @param params.request - The JSON-RPC request object.
 * @returns The JSON-RPC response.
 * @see https://docs.metamask.io/snaps/reference/exports/#onrpcrequest
 * @see https://docs.metamask.io/snaps/reference/rpc-api/#wallet_invokesnap
 * @see https://docs.metamask.io/snaps/reference/permissions/#endowmentnetwork-access
 */
export const onRpcRequest: OnRpcRequestHandler = async ({ request }) => {
  switch (request.method) {
    case 'fetch': {
      const params = request.params as FetchParams | undefined;
      assert(params?.url, 'Required url parameter was not specified.');
      return await getJson(params.url);
    }

    default:
      throw new MethodNotFoundError({ method: request.method });
  }
};

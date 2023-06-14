import { rpcErrors } from '@metamask/rpc-errors';
import { OnRpcRequestHandler } from '@metamask/snaps-types';

import { DEFAULT_URL } from './constants';
import { FetchParams } from './types';

/**
 * Fetch a JSON file from the provided URL. This uses the standard `fetch`
 * function to get the JSON data. Because of CORS, the server must respond with
 * an `Access-Control-Allow-Origin` header set to either `*` or `null`.
 *
 * Note that `fetch` is only available with the `endowment:network-access`
 * permission.
 *
 * @param url - The URL to fetch the data from. This function assumes that the
 * provided URL is a JSON document. Defaults to
 * `https://metamask.github.io/snaps/test-snaps/latest/test-data.json`.
 * @returns There response as JSON.
 * @throws If the provided URL is not a JSON document.
 */
async function getJson(url = DEFAULT_URL) {
  const response = await fetch(url);
  return await response.json();
}

export const onRpcRequest: OnRpcRequestHandler = async ({ request }) => {
  switch (request.method) {
    case 'fetch': {
      const params = request.params as FetchParams | undefined;
      return await getJson(params?.url);
    }

    default:
      throw rpcErrors.methodNotFound({
        data: {
          method: request.method,
        },
      });
  }
};

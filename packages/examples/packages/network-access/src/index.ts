import {
  MethodNotFoundError,
  type OnRpcRequestHandler,
  type OnWebSocketEventHandler,
} from '@metamask/snaps-sdk';
import { assert } from '@metamask/utils';

import type { FetchParams } from './types';

const WEBSOCKET_URL = 'ws://localhost:8545';

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
 * @returns The response as JSON.
 * @throws If the provided URL is not a JSON document.
 */
async function getJson(url: string) {
  const response = await fetch(url);
  return await response.json();
}

/**
 * Open a WebSocket connection to a local Ethereum node and subscribe to
 * block updates.
 *
 * @returns Null.
 * @throws If the WebSocket connection fails to open.
 */
async function subscribe() {
  const id = await snap.request({
    method: 'snap_openWebSocket',
    params: {
      url: WEBSOCKET_URL,
    },
  });

  const message = JSON.stringify({
    jsonrpc: '2.0',
    id: 1,
    method: 'eth_subscribe',
    params: ['newHeads'],
  });

  return snap.request({
    method: 'snap_sendWebSocketMessage',
    params: { id, message },
  });
}

/**
 * Close a WebSocket connection to a local Ethereum node, if it exists.
 *
 * @returns Null.
 */
async function unsubscribe() {
  const sockets = await snap.request({
    method: 'snap_getWebSockets',
  });

  if (sockets.length === 0) {
    return null;
  }

  await snap.request({
    method: 'snap_setState',
    params: {
      key: 'blockNumber',
      value: null,
      encrypted: false,
    },
  });

  const socket = sockets[0];
  return snap.request({
    method: 'snap_closeWebSocket',
    params: { id: socket.id },
  });
}

/**
 * Handle incoming JSON-RPC requests from the dapp, sent through the
 * `wallet_invokeSnap` method. This handler handles four methods:
 *
 * - `fetch`: Fetch a JSON document from the provided URL. This demonstrates
 * that a snap can make network requests through the `fetch` function. Note that
 * the `endowment:network-access` permission must be enabled for this to work.
 * - `startWebSocket`: Open a WebSocket connection to a local Ethereum node
 * and subscribe to block updates.
 * - `closeWebSocket`: Close a WebSocket connection, if one exists.
 * - `getBlockNumber`: Get the latest block number from the WebSocket connection,
 * stored in the Snap state.
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

    case 'startWebSocket':
      return subscribe();

    case 'stopWebSocket':
      return unsubscribe();

    case 'getBlockNumber': {
      return snap.request({
        method: 'snap_getState',
        params: { key: 'blockNumber', encrypted: false },
      });
    }

    default:
      throw new MethodNotFoundError({ method: request.method });
  }
};

export const onWebSocketEvent: OnWebSocketEventHandler = async ({ event }) => {
  if (event.type !== 'message') {
    return;
  }

  assert(event.data.type === 'text');
  const json = JSON.parse(event.data.message);

  if (!json.params?.result) {
    return;
  }

  const blockNumber = parseInt(json.params.result.number.slice(2), 16);

  await snap.request({
    method: 'snap_setState',
    params: { key: 'blockNumber', value: blockNumber, encrypted: false },
  });
};

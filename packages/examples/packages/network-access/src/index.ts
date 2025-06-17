import {
  MethodNotFoundError,
  type OnRpcRequestHandler,
  type OnWebSocketEventHandler,
} from '@metamask/snaps-sdk';
import { assert } from '@metamask/utils';

import type { UrlParams } from './types';

const DEFAULT_WEBSOCKET_URL = 'ws://localhost:8545';

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
 * @param url - The URL of the WebSocket connection.
 * @returns Null.
 * @throws If the WebSocket connection fails to open.
 */
async function subscribe(url: string = DEFAULT_WEBSOCKET_URL) {
  const id = await snap.request({
    method: 'snap_openWebSocket',
    params: {
      url,
    },
  });

  const message = JSON.stringify({
    jsonrpc: '2.0',
    id: 1,
    method: 'eth_subscribe',
    params: ['newHeads'],
  });

  return await snap.request({
    method: 'snap_sendWebSocketMessage',
    params: { id, message },
  });
}

/**
 * Close a WebSocket connection to a local Ethereum node, if it exists.
 *
 * @param url - The URL of the WebSocket connection.
 * @returns Null.
 */
async function unsubscribe(url: string = DEFAULT_WEBSOCKET_URL) {
  const sockets = await snap.request({
    method: 'snap_getWebSockets',
  });

  const socket = sockets.find((socketInfo) => socketInfo.url === url);

  if (!socket) {
    return null;
  }

  return await snap.request({
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
 * - `getState`: Get the state of the Snap, including the block number and whether
 * the WebSocket connection is active.
 *
 * @param params - The request parameters.
 * @param params.request - The JSON-RPC request object.
 * @returns The JSON-RPC response.
 * @see https://docs.metamask.io/snaps/reference/exports/#onrpcrequest
 * @see https://docs.metamask.io/snaps/reference/rpc-api/#wallet_invokesnap
 * @see https://docs.metamask.io/snaps/reference/permissions/#endowmentnetwork-access
 */
export const onRpcRequest: OnRpcRequestHandler = async ({ request }) => {
  const params = request.params as UrlParams | undefined;
  const url = params?.url;

  switch (request.method) {
    case 'fetch': {
      assert(url, 'Required url parameter was not specified.');
      return await getJson(url);
    }

    case 'startWebSocket':
      return subscribe(url);

    case 'stopWebSocket':
      return unsubscribe(url);

    case 'getState': {
      const state = await snap.request({
        method: 'snap_getState',
        params: { encrypted: false },
      });
      return state ?? { blockNumber: null, open: false };
    }

    default:
      throw new MethodNotFoundError({ method: request.method });
  }
};

/**
 * Handle incoming WebSocket events sent by a client.
 *
 * @param params - The request parameters.
 * @param params.event - The WebSocket event.
 * @returns Nothing.
 */
export const onWebSocketEvent: OnWebSocketEventHandler = async ({ event }) => {
  const { origin } = event;

  if (event.type === 'open') {
    await snap.request({
      method: 'snap_setState',
      params: {
        value: { blockNumber: null, origin, open: true },
        encrypted: false,
      },
    });
    return;
  }

  if (event.type === 'close') {
    await snap.request({
      method: 'snap_setState',
      params: {
        value: { blockNumber: null, origin: null, open: false },
        encrypted: false,
      },
    });
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

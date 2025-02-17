import {
  MethodNotFoundError,
  type OnProtocolRequestHandler,
} from '@metamask/snaps-sdk';
import { assert } from '@metamask/utils';

const API_URL = 'https://api.devnet.solana.com';

/**
 * Make an RPC request to the Solana devnet RPC API.
 *
 * @param method - The RPC method to invoke.
 * @returns The JSON-RPC result.
 */
async function rpcRequest(method: string) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method,
    }),
  });
  const json = await response.json();
  return json.result;
}

/**
 * Handle incoming JSON-RPC requests from the multichain API.
 * This handler handles two methods:
 *
 * - `getBlockHeight`: Returns the block height of the Solana devnet.
 * - `getBlockHeight`: Returns the genesis hash of the Solana devnet.
 *
 * @param params - The request parameters.
 * @param params.scope - The CAIP-2 scope of the request.
 * @param params.request - The JSON-RPC request object.
 * @returns The JSON-RPC response.
 */
export const onProtocolRequest: OnProtocolRequestHandler = async ({
  scope,
  request,
}) => {
  // This Snap strictly supports the Solana devnet for now.
  assert(scope === 'solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1');

  switch (request.method) {
    case 'getBlockHeight': {
      return rpcRequest('getBlockHeight');
    }

    case 'getGenesisHash': {
      return rpcRequest('getGenesisHash');
    }

    default:
      // eslint-disable-next-line @typescript-eslint/only-throw-error
      throw new MethodNotFoundError({ method: request.method });
  }
};

import {
  MethodNotFoundError,
  type OnRpcRequestHandler,
} from '@metamask/snaps-sdk';
import type { CaipChainId } from '@metamask/utils';
import { parseCaipChainId } from '@metamask/utils';

import { invokeMethod, Evm, Solana } from './modules';
import type {
  BaseParams,
  SignMessageParams,
  SignTypedDataParams,
} from './types';

// TODO: Consider letting the permission create the "session"
async function createSession() {
  const optionalScopes = {
    'eip155:1': {
      methods: ['personal_sign', 'eth_signTypedData_v4'],
      notifications: [],
      accounts: [],
    },
    'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp': {
      methods: ['signMessage'],
      notifications: [],
      accounts: [],
    },
  };
  // TODO: Fix snap.request types
  return await (snap as any).request({
    method: 'wallet_createSession',
    params: {
      optionalScopes,
    },
  });
}

async function getAccounts(scope: CaipChainId) {
  const session = await await (snap as any).request({
    method: 'wallet_getSession',
  });

  return session.sessionScopes[scope]?.accounts ?? [];
}

function getModule(scope: CaipChainId) {
  const { namespace } = parseCaipChainId(scope);

  switch (namespace) {
    case 'eip155':
      return new Evm(scope);

    case 'solana':
      return new Solana(scope);

    default:
      throw new Error(`${namespace} not supported.`);
  }
}

/**
 * Handle incoming JSON-RPC requests from the dapp, sent through the
 * `wallet_invokeSnap` method. This handler handles six methods:
 *
 * - `getChainId`: Get the current Ethereum chain ID as a string.
 * - `getAccounts`: Get the Ethereum accounts that the snap has access to.
 * - `personalSign`: Sign a message using an Ethereum account.
 * - `signTypedData` Sign a struct using an Ethereum account.
 *
 * @param params - The request parameters.
 * @param params.request - The JSON-RPC request object.
 * @returns The JSON-RPC response.
 * @see https://docs.metamask.io/snaps/reference/exports/#onrpcrequest
 * @see https://docs.metamask.io/snaps/reference/rpc-api/#wallet_invokesnap
 */
export const onRpcRequest: OnRpcRequestHandler = async ({ request }) => {
  const { scope = 'eip155:1' } = (request.params as BaseParams) ?? {};

  const scopeModule = getModule(scope);

  switch (request.method) {
    case 'createSession':
      return await createSession();

    case 'getChainId':
      return await invokeMethod<string>(scope, {
        method: 'eth_chainId',
      });

    case 'getAccounts':
      return await getAccounts(scope);

    case 'signMessage': {
      const params = request.params as SignMessageParams;
      const accounts = await getAccounts(scope);
      return await scopeModule.signMessage(accounts[0], params.message);
    }

    case 'signTypedData': {
      const params = request.params as SignTypedDataParams;
      const accounts = await getAccounts(scope);
      return await scopeModule.signMessage(accounts[0], params.message);
    }

    default:
      throw new MethodNotFoundError({ method: request.method });
  }
};

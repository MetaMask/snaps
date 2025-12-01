import {
  MethodNotFoundError,
  type OnRpcRequestHandler,
} from '@metamask/snaps-sdk';
import type { CaipAccountId, CaipChainId, Hex } from '@metamask/utils';
import {
  assert,
  hexToNumber,
  parseCaipChainId,
  parseCaipAccountId,
} from '@metamask/utils';

import type {
  BaseParams,
  SignMessageParams,
  SignTypedDataParams,
} from './types';
import { invokeMethod } from './modules/base';
import { Evm } from './modules/evm';
import { Solana } from './modules/sol';

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
      accounts: [
        'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp:CYWSQQ2iiFL6EZzuqvMM9o22CZX3N8PowvvkpBXqLK4e',
      ],
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

/**
 * Get the current chain ID using the `ethereum` global. This is essentially
 * the same as the `window.ethereum` global, but does not have access to all
 * methods.
 *
 * Note that using the `ethereum` global requires the
 * `endowment:ethereum-provider` permission.
 *
 * @returns The current chain ID as a string.
 * @see https://docs.metamask.io/snaps/reference/permissions/#endowmentethereum-provider
 */
async function getChainId(scope: CaipChainId) {
  const chainId = await invokeMethod<string>(scope, {
    method: 'eth_chainId',
  });

  assert(chainId, 'Multichain provider did not return a chain ID.');

  return chainId;
}

async function getAccounts(scope: CaipChainId) {
  const session = await await (snap as any).request({
    method: 'wallet_getSession',
  });

  return session.sessionScopes[scope]?.accounts ?? [];
}

/**
 * Sign a struct using the `eth_signTypedData_v4` JSON-RPC method.
 *
 * This uses the Ether Mail struct for example purposes.
 *
 * @param message - The message include in Ether Mail a string.
 * @param from - The account to sign the message with as a string.
 * @returns A signature for the struct and account.
 * @throws If the user rejects the prompt.
 * @see https://docs.metamask.io/snaps/reference/permissions/#endowmentethereum-provider
 * @see https://docs.metamask.io/wallet/concepts/signing-methods/#eth_signtypeddata_v4
 */
async function signTypedData(
  scope: CaipChainId,
  message: string,
  from: CaipAccountId,
) {
  const { namespace, reference } = parseCaipChainId(scope);
  assert(
    namespace === 'eip155',
    'eth_signTypedData_v4 only available for eip155 namespace.',
  );

  const { address } = parseCaipAccountId(from);

  const signature = await invokeMethod<Hex>(scope, {
    method: 'eth_signTypedData_v4',
    params: [
      address,
      {
        types: {
          EIP712Domain: [
            {
              name: 'name',
              type: 'string',
            },
            {
              name: 'version',
              type: 'string',
            },
            {
              name: 'chainId',
              type: 'uint256',
            },
            {
              name: 'verifyingContract',
              type: 'address',
            },
          ],
          Person: [
            {
              name: 'name',
              type: 'string',
            },
            {
              name: 'wallet',
              type: 'address',
            },
          ],
          Mail: [
            {
              name: 'from',
              type: 'Person',
            },
            {
              name: 'to',
              type: 'Person',
            },
            {
              name: 'contents',
              type: 'string',
            },
          ],
        },
        primaryType: 'Mail',
        domain: {
          name: 'Ether Mail',
          version: '1',
          chainId: hexToNumber(reference),
          verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
        },
        message: {
          from: {
            name: 'Snap',
            wallet: address,
          },
          to: {
            name: 'Bob',
            wallet: '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB',
          },
          contents: message,
        },
      },
    ],
  });
  assert(signature, 'Multichain provider did not return a signature.');

  return signature;
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
      return await getChainId(scope);

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
      return await signTypedData(scope, params.message, accounts[0]);
    }

    default:
      throw new MethodNotFoundError({ method: request.method });
  }
};

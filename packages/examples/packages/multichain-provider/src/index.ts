import {
  MethodNotFoundError,
  type OnRpcRequestHandler,
} from '@metamask/snaps-sdk';
import type {
  CaipAccountId,
  CaipChainId,
  Hex,
  JsonRpcRequest,
} from '@metamask/utils';
import {
  assert,
  stringToBytes,
  bytesToHex,
  hexToNumber,
  parseCaipChainId,
  parseCaipAccountId,
} from '@metamask/utils';

import type {
  BaseParams,
  PersonalSignParams,
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
  };
  // TODO: Fix snap.request types
  return await (snap as any).request({
    method: 'wallet_createSession',
    params: {
      optionalScopes,
    },
  });
}

async function invokeMethod<ReturnType>(
  scope: CaipChainId,
  request: Omit<JsonRpcRequest, 'id' | 'jsonrpc'>,
): Promise<ReturnType> {
  // TODO: Fix snap.request types
  return (await (snap as any).request({
    method: 'wallet_invokeMethod',
    params: {
      scope,
      request,
    },
  })) as ReturnType;
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
 * Sign a message using the `personal_sign` JSON-RPC method.
 *
 * @param message - The message to sign as a string.
 * @param from - The account to sign the message with as a string.
 * @returns A signature for the proposed message and account.
 * @throws If the user rejects the prompt.
 * @see https://docs.metamask.io/snaps/reference/permissions/#endowmentethereum-provider
 * @see https://docs.metamask.io/wallet/concepts/signing-methods/#personal_sign
 */
async function personalSign(
  scope: CaipChainId,
  message: string,
  from: CaipAccountId,
) {
  const { namespace } = parseCaipChainId(scope);
  assert(
    namespace === 'eip155',
    'personal_sign only available for eip155 namespace.',
  );

  const { address } = parseCaipAccountId(from);

  const signature = await invokeMethod<Hex>(scope, {
    method: 'personal_sign',
    params: [bytesToHex(stringToBytes(message)), address],
  });
  assert(signature, 'Multichain provider did not return a signature.');

  return signature;
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

  switch (request.method) {
    case 'createSession':
      return await createSession();

    case 'getChainId':
      return await getChainId(scope);

    case 'getAccounts':
      return await getAccounts(scope);

    case 'personalSign': {
      const params = request.params as PersonalSignParams;
      const accounts = await getAccounts(scope);
      return await personalSign(scope, params.message, accounts[0]);
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

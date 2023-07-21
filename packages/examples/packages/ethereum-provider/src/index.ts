import { rpcErrors } from '@metamask/rpc-errors';
import type { OnRpcRequestHandler } from '@metamask/snaps-types';
import type { Hex } from '@metamask/utils';
import { assert, stringToBytes, bytesToHex } from '@metamask/utils';

import type { PersonalSignParams } from './types';

/**
 * Get the current gas price using the `ethereum` global. This is essentially
 * the same as the `window.ethereum` global, but does not have access to all
 * methods.
 *
 * Note that using the `ethereum` global requires the
 * `endowment:ethereum-provider` permission.
 *
 * @returns The current gas price as a hexadecimal string.
 * @see https://docs.metamask.io/snaps/reference/permissions/#endowmentethereum-provider
 */
async function getGasPrice() {
  const gasPrice = await ethereum.request<Hex>({ method: 'eth_gasPrice' });
  assert(gasPrice, 'Ethereum provider did not return a gas price.');

  return gasPrice;
}

/**
 * Get the current network version using the `ethereum` global. This is
 * essentially the same as the `window.ethereum` global, but does not have
 * access to all methods.
 *
 * Note that using the `ethereum` global requires the
 * `endowment:ethereum-provider` permission.
 *
 * @returns The current network version as a string.
 * @see https://docs.metamask.io/snaps/reference/permissions/#endowmentethereum-provider
 */
async function getVersion() {
  const version = await ethereum.request<string>({ method: 'net_version' });
  assert(version, 'Ethereum provider did not return a version.');

  return version;
}

/**
 * Get the Ethereum accounts that the snap has access to using the `ethereum`
 * global. This is essentially the same as the `window.ethereum` global, but
 * does not have access to all methods.
 *
 * If the user hasn't given the snap access to any accounts yet, this JSON-RPC
 * method will show a prompt to the user, asking them to select the accounts to
 * give the snap access to.
 *
 * Note that using the `ethereum` global requires the
 * `endowment:ethereum-provider` permission.
 *
 * @returns The selected accounts as an array of hexadecimal strings.
 * @throws If the user rejects the prompt.
 * @see https://docs.metamask.io/snaps/reference/permissions/#endowmentethereum-provider
 */
async function getAccounts() {
  const accounts = await ethereum.request<string[]>({
    method: 'eth_requestAccounts',
  });
  assert(accounts, 'Ethereum provider did not return accounts.');

  return accounts as string[];
}

/**
 * Sign a message using the `personal_sign` JSON-RPC method.
 *
 * Note that using the `ethereum` global requires the
 * `endowment:ethereum-provider` permission.
 *
 * @param message - The message to sign as a string.
 * @param from - The account to sign the message with as a string.
 * @returns A signature for the proposed message and account.
 * @throws If the user rejects the prompt.
 * @see https://docs.metamask.io/snaps/reference/permissions/#endowmentethereum-provider
 * @see https://docs.metamask.io/wallet/concepts/signing-methods/#personal_sign
 */
async function personalSign(message: string, from: string) {
  const signature = await ethereum.request<Hex>({
    method: 'personal_sign',
    params: [bytesToHex(stringToBytes(message)), from],
  });
  assert(signature, 'Ethereum provider did not return a signature.');

  return signature;
}

/**
 * Handle incoming JSON-RPC requests from the dapp, sent through the
 * `wallet_invokeSnap` method. This handler handles three methods:
 *
 * - `getGasPrice`: Get the current Ethereum gas price as a hexadecimal string.
 * - `getVersion`: Get the current Ethereum network version as a string.
 * - `getAccounts`: Get the Ethereum accounts that the snap has access to.
 *
 * @param params - The request parameters.
 * @param params.request - The JSON-RPC request object.
 * @returns The JSON-RPC response.
 * @see https://docs.metamask.io/snaps/reference/exports/#onrpcrequest
 * @see https://docs.metamask.io/snaps/reference/rpc-api/#wallet_invokesnap
 */
export const onRpcRequest: OnRpcRequestHandler = async ({ request }) => {
  switch (request.method) {
    case 'getGasPrice':
      return await getGasPrice();

    case 'getVersion':
      return await getVersion();

    case 'getAccounts':
      return await getAccounts();

    case 'personalSign': {
      const params = request.params as PersonalSignParams;
      const accounts = await getAccounts();
      return await personalSign(params.message, accounts[0]);
    }

    default:
      throw rpcErrors.methodNotFound({
        data: {
          method: request.method,
        },
      });
  }
};

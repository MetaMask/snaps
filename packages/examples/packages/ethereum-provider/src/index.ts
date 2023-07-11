import { rpcErrors } from '@metamask/rpc-errors';
import { OnRpcRequestHandler } from '@metamask/snaps-types';
import { assert, Hex } from '@metamask/utils';

/**
 * Get the current gas price using the `ethereum` global. This is essentially the
 * same as the `window.ethereum` global, but does not have access to all
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
 * Get the current network version using the `ethereum` global. This is essentially
 * the same as the `window.ethereum` global, but does not have access to all
 * methods.
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
 * Get the Ethereum accounts that the snap has access to using the `ethereum` global.
 * This is essentially the same as the `window.ethereum` global, but does not have access to all
 * methods.
 *
 * If the user hasn't given the snap access to any accounts yet,
 * this JSON-RPC method will show a prompt to the user,
 * asking them to select the accounts to give the snap access to.
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

  return accounts;
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

    default:
      throw rpcErrors.methodNotFound({
        data: {
          method: request.method,
        },
      });
  }
};

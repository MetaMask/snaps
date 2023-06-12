import { rpcErrors } from '@metamask/rpc-errors';
import { OnRpcRequestHandler } from '@metamask/snaps-types';
import { assert, Hex } from '@metamask/utils';

/**
 * Get the current gas price using the `ethereum` global. This essentially the
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
 * Handle incoming JSON-RPC requests from the dapp, sent through the
 * `wallet_invokeSnap` method. This handler handles a single method:
 *
 * - `getGasPrice`: Get the current Ethereum gas price as a hexadecimal string.
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

    default:
      throw rpcErrors.methodNotFound({
        data: {
          method: request.method,
        },
      });
  }
};

import {
  MethodNotFoundError,
  type OnRpcRequestHandler,
} from '@metamask/snaps-sdk';

import { getMessage } from './locales';

/**
 * Handle incoming JSON-RPC requests from the dapp, sent through the
 * `wallet_invokeSnap` method. This handler handles a single method:
 *
 * - `hello`: Responds with "Hello, world!", localized to the user's locale.
 *
 * @param params - The request parameters.
 * @param params.request - The JSON-RPC request object.
 * @see https://docs.metamask.io/snaps/reference/exports/#onrpcrequest
 * @see https://docs.metamask.io/snaps/reference/rpc-api/#wallet_invokesnap
 * @returns The response to send back to the dapp.
 */
export const onRpcRequest: OnRpcRequestHandler = async ({ request }) => {
  switch (request.method) {
    case 'hello':
      return await getMessage('hello');

    default:
      // eslint-disable-next-line @typescript-eslint/no-throw-literal
      throw new MethodNotFoundError({ method: request.method });
  }
};

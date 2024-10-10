import type { OnRpcRequestHandler } from '@metamask/snaps-sdk';
import {
  panel,
  heading,
  copyable,
  text,
  UserRejectedRequestError,
  MethodNotFoundError,
} from '@metamask/snaps-sdk';
// @ts-expect-error Typescript thinks this is ESM Module, not a CommonJS module, while ethers supports both. Webpack will correctly identify proper import type.
import { Wallet } from 'ethers';

import type { SignMessageParams } from './types';
import { getPrivateKey } from './utils';

/**
 * Handle incoming JSON-RPC requests from the dapp, sent through the
 * `wallet_invokeSnap` method. This handler handles two methods:
 *
 * - `getAddress`: Derive a private key using the snap's own entropy, and return
 * the public address for that private key.
 * - `signMessage`: Derive a private key using the snap's own entropy, and sign
 * a message using it. The signature is returned in hex format.
 *
 * @param params - The request parameters.
 * @param params.request - The JSON-RPC request object.
 * @returns The JSON-RPC response.
 * @see https://docs.metamask.io/snaps/reference/exports/#onrpcrequest
 * @see https://docs.metamask.io/snaps/reference/rpc-api/#wallet_invokesnap
 * @see https://docs.metamask.io/snaps/reference/rpc-api/#snap_getentropy
 */
export const onRpcRequest: OnRpcRequestHandler = async ({ request }) => {
  switch (request.method) {
    case 'getAddress': {
      const privateKey = await getPrivateKey();
      const wallet = new Wallet(privateKey);

      return await wallet.getAddress();
    }

    case 'signMessage': {
      const params = request.params as SignMessageParams;

      const privateKey = await getPrivateKey();
      const wallet = new Wallet(privateKey);

      const result = await snap.request({
        method: 'snap_dialog',
        params: {
          type: 'confirmation',
          content: panel([
            heading('Signature request'),
            text('Do you want to sign this message?'),
            copyable(params.message),
          ]),
        },
      });

      if (!result) {
        // eslint-disable-next-line @typescript-eslint/no-throw-literal
        throw new UserRejectedRequestError();
      }

      return wallet.signMessage(params.message);
    }

    default:
      // eslint-disable-next-line @typescript-eslint/no-throw-literal
      throw new MethodNotFoundError({ method: request.method });
  }
};

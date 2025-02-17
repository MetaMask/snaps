import type { OnRpcRequestHandler } from '@metamask/snaps-sdk';
import {
  DialogType,
  panel,
  text,
  heading,
  copyable,
  UserRejectedRequestError,
  MethodNotFoundError,
} from '@metamask/snaps-sdk';
import { bytesToHex, stringToBytes } from '@metamask/utils';
import { sign } from '@noble/bls12-381';

import type { SignMessageParams } from './types';
import { getEntropy } from './utils';

/**
 * Handle incoming JSON-RPC requests from the dapp, sent through the
 * `wallet_invokeSnap` method. This handler handles a single method:
 *
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
    case 'signMessage': {
      const { message, salt } = request.params as SignMessageParams;

      const approved = await snap.request({
        method: 'snap_dialog',
        params: {
          type: DialogType.Confirmation,
          content: panel([
            heading('Signature request'),
            text(
              'Do you want to sign the following message with snap entropy?',
            ),
            copyable(message),
          ]),
        },
      });

      if (!approved) {
        throw new UserRejectedRequestError();
      }

      const privateKey = await getEntropy(salt);
      const newLocal = await sign(stringToBytes(message), privateKey);
      return bytesToHex(newLocal);
    }

    default:
      throw new MethodNotFoundError({ method: request.method });
  }
};

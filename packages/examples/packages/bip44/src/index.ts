import { rpcErrors, providerErrors } from '@metamask/rpc-errors';
import type { OnRpcRequestHandler } from '@metamask/snaps-types';
import { DialogType } from '@metamask/snaps-types';
import { panel, text, heading, copyable } from '@metamask/snaps-ui';
import { bytesToHex, stringToBytes } from '@metamask/utils';
import { getPublicKey, sign } from '@noble/bls12-381';

import type { GetAccountParams, SignMessageParams } from './types';
import { getPrivateKey } from './utils';

/**
 * Handle incoming JSON-RPC requests from the dapp, sent through the
 * `wallet_invokeSnap` method. This handler handles two methods:
 *
 * - `getPublicKey`: Get a BIP-44 public key for a given BIP-44 coin type and
 * address index. The public key is returned in hex format.
 * - `signMessage`: Derive a BIP-44 private key for a given BIP-44 coin type and
 * address index, and use it to sign a message. The signature is returned in hex
 * format.
 *
 * @param params - The request parameters.
 * @param params.request - The JSON-RPC request object.
 * @returns The JSON-RPC response.
 * @see https://docs.metamask.io/snaps/reference/exports/#onrpcrequest
 * @see https://docs.metamask.io/snaps/reference/rpc-api/#wallet_invokesnap
 */
export const onRpcRequest: OnRpcRequestHandler = async ({ request }) => {
  switch (request.method) {
    case 'getPublicKey': {
      const params = request.params as GetAccountParams;
      return bytesToHex(getPublicKey(await getPrivateKey(params)));
    }

    case 'signMessage': {
      const params = request.params as SignMessageParams;
      const privateKey = await getPrivateKey(params);
      const publicKey = bytesToHex(getPublicKey(privateKey));

      const { message } = params;

      const approved = await snap.request({
        method: 'snap_dialog',
        params: {
          type: DialogType.Confirmation,
          content: panel([
            heading('Signature request'),
            text(
              `Do you want to BLS sign "${message}" with the following public key?`,
            ),
            copyable(publicKey),
          ]),
        },
      });

      if (!approved) {
        throw providerErrors.userRejectedRequest();
      }

      const newLocal = await sign(stringToBytes(message), privateKey);
      return bytesToHex(newLocal);
    }

    default:
      throw rpcErrors.methodNotFound({
        data: { method: request.method },
      });
  }
};

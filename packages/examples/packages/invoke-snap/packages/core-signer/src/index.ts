import { rpcErrors, providerErrors } from '@metamask/rpc-errors';
import type { OnRpcRequestHandler } from '@metamask/snaps-types';
import { DialogType } from '@metamask/snaps-types';
import { panel, text, heading, copyable } from '@metamask/snaps-ui';
import { add0x, assert, hexToBytes } from '@metamask/utils';
import { secp256k1 } from '@noble/curves/secp256k1';

import type { GetAccountParams, SignMessageParams } from './types';
import { getEntropy } from './utils';

/**
 * Handle incoming JSON-RPC requests from the other snaps, sent through the
 * `wallet_invokeSnap` method. This handler handles two methods:
 *
 * - `getAccount`: Derive an account using the provided path, and return the
 * public key.
 * - `signMessage`: Sign a message using an {@link Account} object. The message
 * is assumed to be a hexadecimal hash, and signed using `secp256k1`. The
 * signature is returned in hex format.
 *
 * @param params - The request parameters.
 * @param params.request - The JSON-RPC request object.
 * @returns The JSON-RPC response.
 * @see https://docs.metamask.io/snaps/reference/exports/#onrpcrequest
 * @see https://docs.metamask.io/snaps/reference/rpc-api/#wallet_invokesnap
 */
export const onRpcRequest: OnRpcRequestHandler = async ({ request }) => {
  switch (request.method) {
    case 'getAccount': {
      const { path } = request.params as unknown as GetAccountParams;
      const node = await getEntropy();
      const childNode = await node.derive(path);

      return {
        path,
        publicKey: add0x(childNode.publicKey),
      };
    }

    case 'signMessage': {
      const { message, account } =
        request.params as unknown as SignMessageParams;

      const node = await getEntropy();
      const childNode = await node.derive(account.path);
      assert(childNode.privateKeyBytes);

      const approved = await snap.request({
        method: 'snap_dialog',
        params: {
          type: DialogType.Confirmation,
          content: panel([
            heading('Signature request'),
            text('Do you want to sign the following message?'),

            text('Public key'),
            copyable(add0x(childNode.publicKey)),

            text('Message'),
            copyable(message),
          ]),
        },
      });

      if (!approved) {
        throw providerErrors.userRejectedRequest();
      }

      const signature = secp256k1.sign(
        hexToBytes(message),
        childNode.privateKeyBytes,
      );

      return add0x(signature.toDERHex());
    }

    default:
      throw rpcErrors.methodNotFound({
        data: { method: request.method },
      });
  }
};

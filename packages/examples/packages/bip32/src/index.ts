import type { OnRpcRequestHandler } from '@metamask/snaps-sdk';
import {
  DialogType,
  panel,
  text,
  heading,
  copyable,
  InvalidParamsError,
  UserRejectedRequestError,
  MethodNotFoundError,
} from '@metamask/snaps-sdk';
import {
  add0x,
  assert,
  bytesToHex,
  stringToBytes,
  remove0x,
} from '@metamask/utils';
import { sign as signEd25519 } from '@noble/ed25519';
import { sign as signSecp256k1 } from '@noble/secp256k1';

import type { GetBip32PublicKeyParams, SignMessageParams } from './types';
import { getPrivateNode, getPublicKey } from './utils';

/**
 * Handle incoming JSON-RPC requests from the dapp, sent through the
 * `wallet_invokeSnap` method. This handler handles two methods:
 *
 * - `getPublicKey`: Get a BIP-32 public key for a given BIP-32 path. The public
 * key is returned in hex format.
 * - `signMessage`: Derive a BIP-32 private key for a given BIP-32 path, and use
 * it to sign a message. The signature is returned in hex format.
 *
 * @param params - The request parameters.
 * @param params.request - The JSON-RPC request object.
 * @returns The JSON-RPC response.
 * @see https://docs.metamask.io/snaps/reference/exports/#onrpcrequest
 * @see https://docs.metamask.io/snaps/reference/rpc-api/#wallet_invokesnap
 */
export const onRpcRequest: OnRpcRequestHandler = async ({ request }) => {
  switch (request.method) {
    case 'getPublicKey':
      return await getPublicKey(request.params as GetBip32PublicKeyParams);

    case 'signMessage': {
      const { message, curve, ...params } = request.params as SignMessageParams;

      if (!message || typeof message !== 'string') {
        // eslint-disable-next-line @typescript-eslint/no-throw-literal
        throw new InvalidParamsError(`Invalid signature data: "${message}".`);
      }

      const node = await getPrivateNode({ ...params, curve });

      assert(node.privateKey);
      assert(
        curve === 'ed25519' ||
          curve === 'ed25519Bip32' ||
          curve === 'secp256k1',
      );

      const approved = await snap.request({
        method: 'snap_dialog',
        params: {
          type: DialogType.Confirmation,
          content: panel([
            heading('Signature request'),
            text(
              `Do you want to ${curve} sign "${message}" with the following public key?`,
            ),
            copyable(add0x(node.publicKey)),
          ]),
        },
      });

      if (!approved) {
        // eslint-disable-next-line @typescript-eslint/no-throw-literal
        throw new UserRejectedRequestError();
      }

      if (curve === 'ed25519' || curve === 'ed25519Bip32') {
        const signed = await signEd25519(
          stringToBytes(message),
          remove0x(node.privateKey).slice(0, 64),
        );
        return bytesToHex(signed);
      }

      if (curve === 'secp256k1') {
        const signed = await signSecp256k1(
          stringToBytes(message),
          remove0x(node.privateKey),
        );
        return bytesToHex(signed);
      }

      // This is guaranteed to never happen because of the `assert` above. But
      // TypeScript doesn't know that, so we need to throw an error here.
      throw new Error(`Unsupported curve: ${String(curve)}.`);
    }

    default:
      // eslint-disable-next-line @typescript-eslint/no-throw-literal
      throw new MethodNotFoundError({ method: request.method });
  }
};

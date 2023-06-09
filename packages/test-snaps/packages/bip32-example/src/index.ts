import { SLIP10Node } from '@metamask/key-tree';
import { DialogType, OnRpcRequestHandler } from '@metamask/snaps-types';
import { panel, text, heading, copyable } from '@metamask/snaps-ui';
import {
  add0x,
  assert,
  bytesToHex,
  stringToBytes,
  remove0x,
} from '@metamask/utils';
import { sign as signEd25519 } from '@noble/ed25519';
import { sign as signSecp256k1 } from '@noble/secp256k1';
import { ethErrors } from 'eth-rpc-errors';

type GetBip32EntropyParams = {
  path: string[];
  curve: 'secp256k1' | 'ed25519';
  [key: string]: unknown;
};

type GetBip32PublicKeyParams = {
  path: ['m', ...(`${number}` | `${number}'`)[]];
  curve: 'secp256k1' | 'ed25519';
  compressed?: boolean | undefined;
  [key: string]: unknown;
};

type GetAccountParams = GetBip32EntropyParams | GetBip32PublicKeyParams;

type SignMessageParams = GetAccountParams & { message: string };

const getSLIP10Node = async (
  params: GetBip32EntropyParams,
): Promise<SLIP10Node> => {
  const json = await snap.request({
    method: 'snap_getBip32Entropy',
    params,
  });

  return SLIP10Node.fromJSON(json);
};

const getPublicKey = async (
  params: GetBip32PublicKeyParams,
): Promise<string> => {
  return await snap.request({
    method: 'snap_getBip32PublicKey',
    params,
  });
};

// eslint-disable-next-line consistent-return
export const onRpcRequest: OnRpcRequestHandler = async ({ request }) => {
  switch (request.method) {
    case 'getPublicKey':
      return await getPublicKey(
        request.params as unknown as GetBip32PublicKeyParams,
      );

    case 'signMessage': {
      const { message, curve, ...params } = request.params as SignMessageParams;

      if (!message || typeof message !== 'string') {
        throw ethErrors.rpc.invalidParams({
          message: `Invalid signature data: "${message}".`,
        });
      }

      const node = await getSLIP10Node({ ...params, curve });

      assert(node.privateKey);
      assert(curve === 'ed25519' || curve === 'secp256k1');

      const approved = await snap.request({
        method: 'snap_dialog',
        params: {
          type: DialogType.Confirmation,
          content: panel([
            heading('Signature request'),
            text(`Do you want to ${curve} sign ${message} with :`),
            copyable(`${add0x(node.publicKey)}?`),
          ]),
        },
      });

      if (!approved) {
        throw ethErrors.provider.userRejectedRequest();
      }

      if (curve === 'ed25519') {
        const signed = await signEd25519(
          stringToBytes(message),
          remove0x(node.privateKey),
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

      break;
    }

    default:
      throw ethErrors.rpc.methodNotFound({
        data: { method: request.method },
      });
  }
};

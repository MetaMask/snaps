import { rpcErrors, providerErrors } from '@metamask/rpc-errors';
import { DialogType, OnRpcRequestHandler } from '@metamask/snaps-types';
import { panel, text, heading, copyable } from '@metamask/snaps-ui';
import { bytesToHex, stringToBytes } from '@metamask/utils';
import { sign } from '@noble/bls12-381';

import { SignMessageParams } from './types';
import { getEntropy } from './utils';

export const onRpcRequest: OnRpcRequestHandler = async ({ request }) => {
  switch (request.method) {
    case 'signMessage': {
      const { message, salt } = request.params as SignMessageParams;
      const privateKey = await getEntropy(salt);

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

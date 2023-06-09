import { OnRpcRequestHandler } from '@metamask/snaps-types';
import { panel, heading, copyable } from '@metamask/snaps-ui';
import { ethErrors } from 'eth-rpc-errors';
import { Wallet } from 'ethers';

export const onRpcRequest: OnRpcRequestHandler = async ({ request }) => {
  switch (request.method) {
    case 'signMessage': {
      const privKey = await snap.request({
        method: 'snap_getEntropy',
        params: { version: 1 },
      });
      const ethWallet = new Wallet(privKey);
      const data = (request.params as string[])[0];

      if (!data || typeof data !== 'string') {
        throw ethErrors.rpc.invalidParams({
          message: `Invalid signature data: "${data}".`,
        });
      }

      const result = await snap.request({
        method: 'snap_dialog',
        params: {
          type: 'confirmation',
          content: panel([
            heading('Do you want to sign this message?'),
            copyable(data),
          ]),
        },
      });
      if (!result) {
        throw new Error('User rejected request');
      }
      return ethWallet.signMessage(data);
    }

    default:
      throw ethErrors.rpc.methodNotFound({
        data: { method: request.method },
      });
  }
};

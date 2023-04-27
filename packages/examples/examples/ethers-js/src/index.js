/**
 * This example will use its app key as a signing key, and sign anything it is
 * asked to.
 */

const { panel, heading, copyable } = require('@metamask/snaps-ui');
const { Wallet } = require('ethers');

/**
 * Handle incoming JSON-RPC requests, sent through `wallet_invokeSnap`.
 *
 * @param {object} args - The request handler args as object.
 * @param {JsonRpcRequest<unknown[] | Record<string, unknown>>} args.request - A
 * validated JSON-RPC request object.
 * @returns {unknown} The response, based on the request method.
 * @throws If the request method is not valid for this snap.
 */
module.exports.onRpcRequest = async ({ request }) => {
  const privKey = await snap.request({
    method: 'snap_getEntropy',
    params: { version: 1 },
  });
  const ethWallet = new Wallet(privKey);

  switch (request.method) {
    case 'address':
      return ethWallet.address;

    case 'signMessage': {
      const message = request.params[0];
      const result = await snap.request({
        method: 'snap_dialog',
        params: {
          type: 'confirmation',
          content: panel([
            heading('Do you want to sign this message?'),
            copyable(message),
          ]),
        },
      });
      if (!result) {
        throw new Error('User rejected request');
      }
      return ethWallet.signMessage(message);
    }

    default:
      throw new Error('Method not found.');
  }
};

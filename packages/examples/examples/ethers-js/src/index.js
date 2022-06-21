/**
 * This example will use its app key as a signing key, and sign anything it is
 * asked to.
 */

const ethers = require('ethers');

/*
 * The `wallet` API is a superset of the standard provider,
 * and can be used to initialize an ethers.js provider like this:
 */
const provider = new ethers.providers.Web3Provider(wallet);

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
  console.log('received request', request);
  const privKey = await wallet.request({
    method: 'snap_getAppKey',
  });
  console.log(`privKey is ${privKey}`);
  const ethWallet = new ethers.Wallet(privKey, provider);
  console.dir(ethWallet);

  switch (request.method) {
    case 'address':
      return ethWallet.address;

    case 'signMessage': {
      const message = request.params[0];
      console.log('trying to sign message', message);
      return ethWallet.signMessage(message);
    }

    case 'sign': {
      const transaction = request.params[0];
      return ethWallet.sign(transaction);
    }

    default:
      throw new Error('Method not found.');
  }
};

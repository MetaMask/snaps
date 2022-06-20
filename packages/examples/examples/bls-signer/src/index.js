const { errors: rpcErrors } = require('eth-json-rpc-errors');
const bls = require('noble-bls12-381');

const DOMAIN = 2;

console.log('Hello from bls-snap!');

/**
 * Handle incoming JSON-RPC requests, sent through `wallet_invokeSnap`.
 *
 * @param {object} args - The request handler args as object.
 * @param {JsonRpcRequest<unknown[] | Record<string, unknown>>} args.request - A
 * validated JSON-RPC request object.
 * @returns {unknown} The response, based on the request method.
 * @throws If the request method is not valid for this snap.
 * @throws If the user denied a signature request.
 */
module.exports.onRpcRequest = async ({ request }) => {
  switch (request.method) {
    case 'getAccount':
      return await getPubKey();

    case 'signMessage': {
      const pubKey = await getPubKey();
      const data = request.params[0];
      const approved = await promptUser(
        'BLS signature request',
        `Do you want to BLS sign ${data} with ${pubKey}?`,
      );
      if (!approved) {
        throw rpcErrors.eth.unauthorized();
      }
      const PRIVATE_KEY = await wallet.request({
        method: 'snap_getAppKey',
      });
      const signature = await bls.sign(request.params[0], PRIVATE_KEY, DOMAIN);
      return signature;
    }

    default:
      throw rpcErrors.methodNotFound(request);
  }
};

/**
 * Gets the BLS12-381 public key based on the snap private key.
 *
 * @returns {Promise<Uint8Array>} The BLS12-381 public key.
 */
async function getPubKey() {
  const PRIV_KEY = await wallet.request({
    method: 'snap_getAppKey',
  });
  return bls.getPublicKey(PRIV_KEY);
}

/**
 * Displays a prompt to the user in the MetaMask UI.
 *
 * @param {string} header - A prompt, phrased as a question, no greater than 40
 * characters long.
 * @param {string} [message] - Free-from text content, no greater than 1800
 * characters long.
 * @returns {Promise<boolean>} `true` if the user accepted the confirmation,
 * and `false` otherwise.
 */
async function promptUser(header, message) {
  const response = await wallet.request({
    method: 'snap_confirm',
    params: [{ prompt: header, textAreaContent: message }],
  });
  return response;
}

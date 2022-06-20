const { errors: rpcErrors } = require('eth-json-rpc-errors');
const bls = require('noble-bls12-381');

const DOMAIN = 2;

console.log('Hello from bls-snap!');

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
 * Gets the BLS public key corresponding to this snap's app key.
 *
 * @returns {Uint8Array} The BLS public key.
 */
async function getPubKey() {
  const PRIV_KEY = await wallet.request({
    method: 'snap_getAppKey',
  });
  return bls.getPublicKey(PRIV_KEY);
}

/**
 * Displays a prompt to the user inside MetaMask.
 *
 * @param {string} header - The prompt header.
 * @param {string} message - The prompt message.
 * @returns {boolean} `true` if the user accepted the prompt, and `false`
 * otherwise.
 */
async function promptUser(header, message) {
  const response = await wallet.request({
    method: 'snap_confirm',
    params: [{ prompt: header, textAreaContent: message }],
  });
  return response;
}

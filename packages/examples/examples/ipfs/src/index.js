const { errors: rpcErrors } = require('eth-json-rpc-errors');
const { IPFS } = require('./ipfs');

const ipfs = new IPFS({
  host: 'ipfs.infura.io',
  protocol: 'https',
});

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
  switch (request.method) {
    case 'add':
      return await ipfs.add(request.params[0]);
    case 'cat':
      return await ipfs.cat(request.params[0]);
    default:
      throw rpcErrors.eth.methodNotFound(request);
  }
};

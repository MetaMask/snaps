/**
 * Handle incoming JSON-RPC requests, sent through `wallet_invokeSnap`.
 *
 * @param {object} args - The request handler args as object.
 * @param {string} args.origin - The origin of the request, e.g., the website
 * that invoked the snap.
 * @param {JsonRpcRequest<unknown[] | Record<string, unknown>>} args.request - A
 * validated JSON-RPC request object.
 * @returns {boolean} `true` if the request succeeded, `false` otherwise.
 * @throws If the request method is not valid for this snap.
 */
module.exports.onRpcRequest = async ({ origin, request }) => {
  switch (request.method) {
    case 'inApp':
      return wallet.request({
        method: 'snap_notify',
        params: [
          {
            type: 'inApp',
            message: `Hello, ${origin}!`,
          },
        ],
      });
    case 'native':
      return wallet.request({
        method: 'snap_notify',
        params: [
          {
            type: 'native',
            message: `Hello, ${origin}!`,
          },
        ],
      });
    default:
      throw new Error('Method not found.');
  }
};

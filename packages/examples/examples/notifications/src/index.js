/**
 * Handle incoming JSON-RPC requests, sent through `wallet_invokeSnap`.
 *
 * @param {object} args - The request handler args as object.
 * @param {string} args.origin - The origin of the request, e.g., the website
 * that invoked the snap.
 * @param {JsonRpcRequest<unknown[] | Record<string, unknown>>} args.request - A
 * validated JSON-RPC request object.
 * @returns {boolean} `null` if the request succeeded.
 * @throws If the request method is not valid for this snap.
 * @throws If the `snap_notify` call failed.
 */
module.exports.onRpcRequest = async ({ origin, request }) => {
  switch (request.method) {
    case 'inApp':
      return snap.request({
        method: 'snap_notify',
        params: {
          type: 'inApp',
          message: `Hello, ${origin}!`,
        },
      });
    case 'native':
      return snap.request({
        method: 'snap_notify',
        params: {
          type: 'native',
          message: `Hello, ${origin}!`,
        },
      });
    default:
      throw new Error('Method not found.');
  }
};

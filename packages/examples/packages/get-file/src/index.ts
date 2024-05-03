import {
  MethodNotFoundError,
  type OnRpcRequestHandler,
} from '@metamask/snaps-sdk';

/**
 * Handle incoming JSON-RPC requests from the dapp, sent through the
 * `wallet_invokeSnap` method. This handler handles two methods:
 *
 * - `getFile`: Returns a statically defined JSON file. This uses the
 * `snap_getFile` JSON-RPC method to get this file and parses it before returning.
 * - `getFileInBase64`: Returns a statically defined JSON file in Base64.
 * This uses the `snap_getFile` JSON-RPC method to get this file returns it directly.
 * - `getFileInHex`: Returns a statically defined JSON file in hexadecimal.
 * This uses the `snap_getFile` JSON-RPC method to get this file returns it directly.
 *
 * @param params - The request parameters.
 * @param params.request - The JSON-RPC request object.
 * @returns The JSON-RPC response.
 * @see https://docs.metamask.io/snaps/reference/exports/#onrpcrequest
 * @see https://docs.metamask.io/snaps/reference/rpc-api/#wallet_invokesnap
 * @see https://docs.metamask.io/snaps/reference/rpc-api/#snap_getfile
 */
export const onRpcRequest: OnRpcRequestHandler = async ({ request }) => {
  switch (request.method) {
    case 'getFile': {
      const fileInPlaintext = await snap.request({
        method: 'snap_getFile',
        params: { path: './files/foo.json', encoding: 'utf8' },
      });
      return JSON.parse(fileInPlaintext);
    }

    case 'getFileInBase64': {
      return await snap.request({
        method: 'snap_getFile',
        // Encoding is optional and defaults to base64
        params: { path: './files/foo.json' },
      });
    }

    case 'getFileInHex': {
      return await snap.request({
        method: 'snap_getFile',
        params: { path: './files/foo.json', encoding: 'hex' },
      });
    }

    default:
      throw new MethodNotFoundError({ method: request.method });
  }
};

import { rpcErrors } from '@metamask/rpc-errors';
import type { OnRpcRequestHandler } from '@metamask/snaps-types';
import { bytesToString, hexToBytes } from '@metamask/utils';

/**
 * Handle incoming JSON-RPC requests from the dapp, sent through the
 * `wallet_invokeSnap` method. This handler handles two methods:
 *
 * - `getFile`: Returns a statically defined JSON file. This uses the
 * `snap_getFile` JSON-RPC method to get this file and parses it before returning.
 * - `getFileInBase64`: Returns a statically defined JSON file in Base64.
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
      const fileInHexadecimal = await snap.request({
        method: 'snap_getFile',
        params: { path: './src/foo.json', encoding: 'hex' },
      });
      const bytes = hexToBytes(fileInHexadecimal);
      return JSON.parse(bytesToString(bytes));
    }

    case 'getFileInBase64': {
      return await snap.request({
        method: 'snap_getFile',
        // Encoding is optional and defaults to base64
        params: { path: './src/foo.json' },
      });
    }

    default:
      throw rpcErrors.methodNotFound({
        data: { method: request.method },
      });
  }
};

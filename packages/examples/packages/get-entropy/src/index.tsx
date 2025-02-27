import type { OnRpcRequestHandler } from '@metamask/snaps-sdk';
import {
  DialogType,
  MethodNotFoundError,
  UserRejectedRequestError,
} from '@metamask/snaps-sdk';
import { Box, Copyable, Heading, Text } from '@metamask/snaps-sdk/jsx';
import { bytesToHex, stringToBytes } from '@metamask/utils';
import { sign } from '@noble/bls12-381';

import type { SignMessageParams } from './types';
import { getEntropy, getEntropySourceName } from './utils';

/**
 * Handle incoming JSON-RPC requests from the dapp, sent through the
 * `wallet_invokeSnap` method. This handler handles two methods:
 *
 * - `signMessage`: Derive a private key using the Snap's own entropy, and sign
 * a message using it. The signature is returned in hex format.
 * - `getEntropySources`: Get the list of entropy sources available to the Snap.
 *
 * @param params - The request parameters.
 * @param params.request - The JSON-RPC request object.
 * @returns The JSON-RPC response.
 * @see https://docs.metamask.io/snaps/reference/exports/#onrpcrequest
 * @see https://docs.metamask.io/snaps/reference/rpc-api/#wallet_invokesnap
 * @see https://docs.metamask.io/snaps/reference/rpc-api/#snap_getentropy
 */
export const onRpcRequest: OnRpcRequestHandler = async ({ request }) => {
  switch (request.method) {
    case 'signMessage': {
      const { message, salt, source } = request.params as SignMessageParams;

      const approved = await snap.request({
        method: 'snap_dialog',
        params: {
          type: DialogType.Confirmation,
          content: (
            <Box>
              <Heading>Signature request</Heading>
              <Text>
                Do you want to sign the following message with Snap entropy, and
                the entropy source "{await getEntropySourceName(source)}"?
              </Text>
              <Copyable value={message} />
            </Box>
          ),
        },
      });

      if (!approved) {
        throw new UserRejectedRequestError();
      }

      const privateKey = await getEntropy(salt, source);
      const newLocal = await sign(stringToBytes(message), privateKey);
      return bytesToHex(newLocal);
    }

    case 'getEntropySources': {
      return await snap.request({
        method: 'snap_listEntropySources',
      });
    }

    default:
      throw new MethodNotFoundError({ method: request.method });
  }
};

import type { OnRpcRequestHandler } from '@metamask/snaps-sdk';
import {
  DialogType,
  MethodNotFoundError,
  UserRejectedRequestError,
} from '@metamask/snaps-sdk';
import { Box, Copyable, Heading, Text } from '@metamask/snaps-sdk/jsx';
import { bytesToHex, stringToBytes } from '@metamask/utils';
import { getPublicKey, sign } from '@noble/bls12-381';

import type { GetAccountParams, SignMessageParams } from './types';
import { getPrivateKey } from './utils';

/**
 * Handle incoming JSON-RPC requests from the dapp, sent through the
 * `wallet_invokeSnap` method. This handler handles three methods:
 *
 * - `getPublicKey`: Get a BIP-44 public key for a given BIP-44 coin type and
 * address index. The public key is returned in hex format.
 * - `signMessage`: Derive a BIP-44 private key for a given BIP-44 coin type and
 * address index, and use it to sign a message. The signature is returned in hex
 * format.
 * - `getEntropySources`: Get the list of entropy sources available to the Snap.
 *
 * @param params - The request parameters.
 * @param params.request - The JSON-RPC request object.
 * @returns The JSON-RPC response.
 * @see https://docs.metamask.io/snaps/reference/exports/#onrpcrequest
 * @see https://docs.metamask.io/snaps/reference/rpc-api/#wallet_invokesnap
 */
export const onRpcRequest: OnRpcRequestHandler = async ({ request }) => {
  switch (request.method) {
    case 'getPublicKey': {
      const params = request.params as GetAccountParams;
      return bytesToHex(getPublicKey(await getPrivateKey(params)));
    }

    case 'signMessage': {
      const params = request.params as SignMessageParams;
      const privateKey = await getPrivateKey(params);
      const publicKey = bytesToHex(getPublicKey(privateKey));

      const { message } = params;

      const approved = await snap.request({
        method: 'snap_dialog',
        params: {
          type: DialogType.Confirmation,
          content: (
            <Box>
              <Heading>Signature request</Heading>
              <Text>
                Do you want to BLS sign "{message}" with the following public
                key?
              </Text>
              <Copyable value={publicKey} />
            </Box>
          ),
        },
      });

      if (!approved) {
        throw new UserRejectedRequestError();
      }

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

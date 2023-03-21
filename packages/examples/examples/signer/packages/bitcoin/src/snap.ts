import { OnRpcRequestHandler } from '@metamask/snaps-types';
import {
  assert,
  bytesToHex,
  hasProperty,
  isPlainObject,
  stringToBytes,
} from '@metamask/utils';
import { sign, utils } from '@noble/secp256k1';

const SIGNER_SNAP_ID = 'local:http://localhost:8100';

type Transaction = {
  to: string;
  value: string;
};

/**
 * Handle incoming JSON-RPC requests, sent through `wallet_invokeSnap`. At the
 * moment, this snap only supports one method: `deriveKey`, which derives a
 * BIP-32 child node from the root node.
 *
 * @param args - The request handler args as object.
 * @param args.request - A JSON-RPC request object.
 * @returns The result of the request.
 */
export const onRpcRequest: OnRpcRequestHandler = async ({ request }) => {
  switch (request.method) {
    case 'signTransaction': {
      assert(isPlainObject(request.params), 'Expected object parameters.');
      assert(hasProperty(request.params, 'to'), 'Expected "to" parameter.');
      assert(
        hasProperty(request.params, 'value'),
        'Expected "value" parameter.',
      );

      const node = await snap.request({
        method: 'wallet_invokeSnap',
        params: {
          snapId: SIGNER_SNAP_ID,
          request: {
            method: 'deriveKey',
            params: {
              path: ["bip32:44'", "bip32:0'", "bip32:0'", 'bip32:0', 'bip32:0'],
            },
          },
        },
      });

      assert(isPlainObject(node), 'Expected object response.');
      assert(
        hasProperty(node, 'privateKey'),
        'Expected "privateKey" property.',
      );

      return await signTransaction(
        node.privateKey as string,
        request.params as Transaction,
      );
    }

    default:
      throw new Error(`Method not found: ${request.method}.`);
  }
};

/**
 * Sign a transaction with a private key.
 *
 * @param privateKey - The private key to sign with.
 * @param transaction - The transaction to sign.
 * @param transaction.to - The address to send the transaction to.
 * @param transaction.value - The amount to send.
 * @returns The signed transaction.
 */
async function signTransaction(privateKey: string, transaction: Transaction) {
  // This does not actually create a valid Bitcoin transaction. It just
  // demonstrates that we can sign something with a Bitcoin private key.
  const signedTransaction = await sign(
    await utils.sha256(stringToBytes(JSON.stringify(transaction))),
    privateKey.slice(2),
  );

  return bytesToHex(signedTransaction);
}

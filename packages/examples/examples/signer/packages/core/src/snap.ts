import { SLIP10Node, secp256k1 } from '@metamask/key-tree';
import { createBip39KeyFromSeed } from '@metamask/key-tree/dist/derivers/bip39';
import { OnRpcRequestHandler } from '@metamask/snaps-types';
import {
  assert,
  hasProperty,
  hexToBytes,
  isPlainObject,
} from '@metamask/utils';

/**
 * Get a root BIP-32 node based on the snap's entropy.
 *
 * @returns The root BIP-32 node as {@link SLIP10Node}.
 */
async function getEntropy(): Promise<SLIP10Node> {
  // Request the snap's entropy. This is unique to the snap, and is guaranteed
  // to be the same for every request.
  const entropy = await snap
    .request({
      method: 'snap_getEntropy',
      params: {
        version: 1,
        salt: 'Signing Entropy',
      },
    })
    .then(hexToBytes);

  // Derive the root BIP-32 node from the entropy.
  return await createBip39KeyFromSeed(entropy, secp256k1);
}

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
    // Derive a BIP-32 child node from the root node. The path is expected to be
    // a `key-tree` path, e.g., `["bip32:44'", "bip32:60'"]`.
    case 'deriveKey': {
      // We do some basic validation of the request parameters. This is not
      // exhaustive, but it's a good start.
      assert(isPlainObject(request.params), 'Expected params to be an object.');
      assert(
        hasProperty(request.params, 'path'),
        'Expected params to have a path property.',
      );
      assert(
        Array.isArray(request.params.path),
        'Expected params to be an array.',
      );

      // Get the root BIP-32 node, and derive the child node.
      const node = await getEntropy();
      const childNode = await node.derive(request.params.path);

      return childNode.toJSON();
    }

    default:
      throw new Error(`Method not found: ${request.method}.`);
  }
};

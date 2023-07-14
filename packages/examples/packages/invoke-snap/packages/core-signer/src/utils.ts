import type { SLIP10Node } from '@metamask/key-tree';
import { secp256k1, createBip39KeyFromSeed } from '@metamask/key-tree';
import { assertIsHexString, bytesToHex, hexToBytes } from '@metamask/utils';
import { Mutex } from 'async-mutex';

const mutex = new Mutex();

/**
 * Get a root BIP-32 node, based on the snap's own entropy. If the snap has not
 * stored entropy yet, it will generate some entropy using the WebCrypto API,
 * and store it in the state using `snap_manageState`. On subsequent calls to
 * this function, it will get the entropy from the state, and use that instead.
 *
 * We could use `snap_getEntropy` as well, but this way we can demonstrate that
 * a snap can manage its own entropy, and allow other snaps to consume it.
 *
 * @returns The root BIP-32 node as {@link SLIP10Node}.
 */
export async function getEntropy(): Promise<SLIP10Node> {
  // In theory two snaps can call this function at the same time, resulting in
  // entropy being generated twice. To prevent this, we wrap it in an async
  // mutex, which will block execution until the first call has finished.
  return await mutex.runExclusive(async () => {
    const state = await snap.request({
      method: 'snap_manageState',
      params: {
        operation: 'get',
      },
    });

    // If we have entropy in state, use it to derive the root BIP-32 node.
    if (state?.entropy) {
      assertIsHexString(state.entropy);

      // Derive the root BIP-32 node from the entropy.
      return await createBip39KeyFromSeed(hexToBytes(state.entropy), secp256k1);
    }

    // Otherwise, generate some entropy and store it in state.
    const entropy = crypto.getRandomValues(new Uint8Array(32));
    await snap.request({
      method: 'snap_manageState',
      params: {
        operation: 'update',
        newState: {
          entropy: bytesToHex(entropy),
        },
      },
    });

    // Derive the root BIP-32 node from the entropy.
    return await createBip39KeyFromSeed(entropy, secp256k1);
  });
}

import { remove0x } from '@metamask/utils';

/**
 * Derive entropy which can be used as private key using the `snap_getEntropy`
 * JSON-RPC method. This method returns entropy which is specific to the snap,
 * so other snaps cannot replicate this entropy. This entropy is deterministic,
 * meaning that it will always be the same.
 *
 * The entropy is derived from the snap ID and the salt. The salt is used to
 * generate different entropy for different use cases. For example, in this
 * example we use the salt "Signing key" to generate entropy which can be used
 * as a private key.
 *
 * @param salt - The salt to use for the entropy derivation. Using a different
 * salt will result in completely different entropy being generated.
 * @returns The generated entropy, without the leading "0x".
 * @see https://docs.metamask.io/snaps/reference/rpc-api/#snap_getentropy
 */
export async function getEntropy(salt = 'Signing key') {
  const entropy = await snap.request({
    method: 'snap_getEntropy',
    params: {
      version: 1,
      salt,
    },
  });

  return remove0x(entropy);
}

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
 * @param source - The entropy source to use for the entropy derivation. If not
 * provided, the primary entropy source will be used.
 * @returns The generated entropy, without the leading "0x".
 * @see https://docs.metamask.io/snaps/reference/rpc-api/#snap_getentropy
 */
export async function getEntropy(
  salt = 'Signing key',
  source?: string | undefined,
) {
  const entropy = await snap.request({
    method: 'snap_getEntropy',
    params: {
      version: 1,
      salt,
      source,
    },
  });

  return remove0x(entropy);
}

/**
 * Get the name of an entropy source by its ID using the
 * `snap_listEntropySources` JSON-RPC method.
 *
 * If the ID is not provided, the name of the primary entropy source will be
 * returned.
 *
 * @param id - The ID of the entropy source.
 * @returns The name of the entropy source.
 */
export async function getEntropySourceName(id?: string | undefined) {
  if (id) {
    const sources = await snap.request({
      method: 'snap_listEntropySources',
    });

    const source = sources.find((item) => item.id === id);
    if (source) {
      if (source.name.length > 0) {
        return source.name;
      }

      return source.id;
    }

    return 'unknown source';
  }

  return 'primary source';
}

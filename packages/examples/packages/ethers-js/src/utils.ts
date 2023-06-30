/**
 * Derive entropy which can be used as private key using the `snap_getEntropy`
 * JSON-RPC method. This method returns entropy which is specific to the snap,
 * so other snaps cannot replicate this entropy.
 *
 * We specify a salt to indicate that the entropy will be used as private key.
 * Using a different salt will result in completely different entropy being
 * generated.
 *
 * @returns The generated entropy. This remains the same as long as the snap ID
 * is the same.
 * @see https://docs.metamask.io/snaps/reference/rpc-api/#snap_getentropy
 */
export async function getPrivateKey() {
  return await snap.request({
    method: 'snap_getEntropy',

    // The salt must remain the same for the same entropy to be derived.
    params: { version: 1, salt: 'Signing key' },
  });
}

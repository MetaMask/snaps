import { SLIP10Node } from '@metamask/key-tree';

import type { GetBip32PublicKeyParams, SignMessageParams } from './types';

/**
 * Get an extended private key BIP-32 node, using the `snap_getBip32Entropy`
 * method.
 *
 * @param params - The parameters for calling the `snap_getBip32Entropy` method.
 * These are passed directly to the method, and are not validated beforehand.
 * @returns A {@link SLIP10Node} instance, which is a hierarchical deterministic
 * wallet node, generated using `@metamask/key-tree`. This instance contains the
 * private key, which can be used to sign messages.
 * @see https://docs.metamask.io/snaps/reference/rpc-api/#snap_getbip32entropy
 */
export const getPrivateNode = async (
  params: Omit<SignMessageParams, 'message'>,
): Promise<SLIP10Node> => {
  // `snap_getBip32Entropy` returns a `JsonSLIP10Node` object, which can be
  // deserialized into a `SLIP10Node` instance by `@metamask/key-tree`.
  const json = await snap.request({
    method: 'snap_getBip32Entropy',
    params,
  });

  return SLIP10Node.fromJSON(json);
};

/**
 * Get a BIP-32 public key, using the `snap_getBip32PublicKey` method.
 *
 * @param params - The parameters for calling the `snap_getBip32PublicKey`
 * method. These are passed directly to the method, and are not validated
 * beforehand.
 * @returns The public key, as a hex string.
 * @see https://docs.metamask.io/snaps/reference/rpc-api/#snap_getbip32publickey
 */
export const getPublicKey = async (
  params: GetBip32PublicKeyParams,
): Promise<string> => {
  return await snap.request({
    method: 'snap_getBip32PublicKey',
    params,
  });
};

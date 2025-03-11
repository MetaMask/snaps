import type { Bip32Entropy } from '../permissions';

/**
 * The request parameters for the `snap_getBip32PublicKey` method.
 */
export type GetBip32PublicKeyParams = Bip32Entropy & {
  /**
   * Whether to return the compressed public key. Defaults to `false`.
   */
  compressed?: boolean;

  /**
   * The ID of the entropy source to use. If not specified, the primary entropy
   * source will be used. For a list of available entropy sources, see the
   * `snap_listEntropySources` method.
   */
  source?: string | undefined;
};

/**
 * The result returned by the `snap_getBip32PublicKey` method.
 *
 * It is the public key in hexadecimal format, in either compressed or
 * uncompressed format, depending on the `compressed` parameter.
 */
export type GetBip32PublicKeyResult = string;

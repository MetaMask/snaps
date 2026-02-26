import type { Hex } from '@metamask/utils';

/**
 * An object containing the parameters for the `snap_getEntropy` method.
 */
export type GetEntropyParams = {
  /**
   * The version of the entropy to retrieve. This is reserved for future use,
   * and as of now, only version 1 is supported.
   */
  version: 1;

  /**
   * An arbitrary string to be used as a salt for the entropy. This can be used
   * to generate different entropy for different purposes.
   */
  salt?: string | undefined;

  /**
   * The ID of the entropy source to use. If not specified, the primary entropy
   * source will be used. For a list of available entropy sources, see the
   * `snap_listEntropySources` method.
   */
  source?: string | undefined;
};

/**
 * The entropy as a hexadecimal string.
 */
export type GetEntropyResult = Hex;

import type { Hex } from '@metamask/utils';

/**
 * The request parameters for the `snap_getEntropy` method.
 */
export type GetEntropyParams = {
  /**
   * The version of the entropy to retrieve. This is used for backwards
   * compatibility. As of now, only version 1 is supported.
   */
  version: 1;

  /**
   * The optional salt to use when deriving the entropy.
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
 * The result returned by the `snap_getEntropy` method.
 */
export type GetEntropyResult = Hex;

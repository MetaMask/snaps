/**
 * An entropy source that can be used to retrieve entropy using the
 * `snap_get*Entropy` methods.
 */
export type EntropySource = {
  /**
   * The name of the entropy source.
   */
  name: string;

  /**
   * The ID of the entropy source
   */
  id: string;

  /**
   * The type of the entropy source. Currently, only `mnemonic` is supported.
   */
  type: 'mnemonic';

  /**
   * Whether the entropy source is the primary source.
   */
  primary: boolean;
};

/**
 * The request parameters for the `snap_listEntropySources` method.
 */
export type ListEntropySourcesParams = never;

/**
 * The result returned by the `snap_listEntropySources` method.
 */
export type ListEntropySourcesResult = EntropySource[];

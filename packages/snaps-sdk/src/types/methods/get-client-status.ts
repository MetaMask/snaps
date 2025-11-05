/**
 * The request parameters for the `snap_getClientStatus` method.
 *
 * This method does not accept any parameters.
 */
export type GetClientStatusParams = never;

/**
 * The result returned by the `snap_getClientStatus` method.
 *
 * It returns an object containing useful information about the client.
 */
export type GetClientStatusResult = {
  /**
   * The semantic version of the client that the Snap is running in.
   */
  clientVersion: string;
  /**
   * The Snaps Platform version that the client is running.
   */
  platformVersion: string;
  /**
   * A boolean flag that indicates whether the client is locked or not.
   */
  locked: boolean;
  /**
   * A boolean flag that indicates whether the client is active or not.
   */
  active: boolean;
};

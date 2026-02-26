/**
 * This method does not accept any parameters.
 */
export type GetClientStatusParams = never;

/**
 * An object containing information about the client that the Snap is running
 * in.
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
   * A boolean flag that indicates whether the client is active or not. The
   * client is considered active if the client is visible.
   */
  active: boolean;
};

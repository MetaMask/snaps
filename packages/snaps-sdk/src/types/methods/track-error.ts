/**
 * An error that can be tracked by the `snap_trackError` method.
 */
export type TrackableError = {
  /**
   * The name of the error. This is typically the constructor name of the
   * error, such as `TypeError`, `ReferenceError`, or a custom error name.
   */
  name: string;

  /**
   * The error message.
   */
  message: string;

  /**
   * The error stack, if available. If the error does not have a stack, this
   * will be `null`.
   */
  stack: string | null;

  /**
   * The cause of the error, if available. This can be another error object or
   * `null` if there is no cause.
   */
  cause: TrackableError | null;
};

/**
 * The parameters for the `snap_trackError` method.
 *
 * Note that this method is only available to preinstalled Snaps.
 */
export type TrackErrorParams = {
  /**
   * The error object to track.
   */
  error: TrackableError;
};

/**
 * The result returned by the `snap_trackEvent` method. This is the ID of the
 * tracked error, as returned by the Sentry instance in the client.
 */
export type TrackErrorResult = string;

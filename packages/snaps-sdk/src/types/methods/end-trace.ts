import type { TraceName } from './start-trace';

/**
 * A request to end a pending trace.
 */
export type EndTraceRequest = {
  /**
   * The unique identifier of the trace.
   * Defaults to 'default' if not provided.
   */
  id?: string;

  /**
   * The name of the trace.
   */
  name: TraceName;

  /**
   * Override the end time of the trace.
   */
  timestamp?: number;
};

/**
 * The request parameters for the `snap_endTrace` method. This method is used
 * to end a performance trace in Sentry.
 *
 * Note that this method is only available to preinstalled Snaps.
 */
export type EndTraceParams = EndTraceRequest;

/**
 * The result returned by the `snap_endTrace` method.
 */
export type EndTraceResult = null;

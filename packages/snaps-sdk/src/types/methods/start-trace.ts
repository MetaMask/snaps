import type { Json } from '@metamask/utils';

/**
 * The name of the trace context.
 *
 * The client uses an enum to define the trace names, but to avoid needing to
 * copy and update the enum in multiple places, we use a string type here.
 */
export type TraceName = string;

/**
 * A context object to associate traces with each other and generate nested
 * traces.
 */
export type TraceContext = Json;

/**
 * A request to create a new performance trace in Sentry.
 */
// This type is copied from `metamask-extension`, and should match that type.
export type TraceRequest = {
  /**
   * Custom data to associate with the trace.
   */
  data?: Record<string, number | string | boolean>;

  /**
   * A unique identifier when not tracing a callback.
   * Defaults to 'default' if not provided.
   */
  id?: string;

  /**
   * The name of the trace.
   */
  name: TraceName;

  /**
   * The parent context of the trace.
   * If provided, the trace will be nested under the parent trace.
   */
  parentContext?: TraceContext;

  /**
   * Override the start time of the trace.
   */
  startTime?: number;

  /**
   * Custom tags to associate with the trace.
   */
  tags?: Record<string, number | string | boolean>;
};

/**
 * The request parameters for the `snap_startTrace` method. This method is used
 * to start a performance trace in Sentry.
 *
 * Note that this method is only available to preinstalled Snaps.
 */
export type StartTraceParams = TraceRequest;

/**
 * The result returned by the `snap_startTrace` method.
 *
 * This is the trace context that can be used to end the trace later.
 */
export type StartTraceResult = TraceContext;

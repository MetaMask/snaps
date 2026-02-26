import type { Cronjob } from '../permissions';

/**
 * An object containing the parameters for the `snap_scheduleBackgroundEvent`
 * method.
 */
export type ScheduleBackgroundEventParams =
  | {
      /**
       * The ISO 8601 date string of when to fire the background event (e.g.,
       * `"2025-01-01T00:00:00Z"`).
       */
      date: string;

      /**
       * The JSON-RPC request to call when the event fires.
       */
      request: Cronjob['request'];
    }
  | {
      /**
       * The ISO 8601 duration string of how long to wait before firing the
       * background event (e.g., `"P1D"` for one day). The resulting date will
       * be calculated in UTC.
       */
      duration: string;

      /**
       * The JSON-RPC request to call when the event fires.
       */
      request: Cronjob['request'];
    };

/**
 * The ID of the scheduled background event.
 */
export type ScheduleBackgroundEventResult = string;

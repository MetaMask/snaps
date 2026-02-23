import type { Cronjob } from '../permissions';

/**
 * The request parameters for the `snap_scheduleBackgroundEvent` method.
 *
 * Note: The date generated from a duration will be represented in UTC.
 *
 * @property date - The ISO 8601 date of when to fire the background event.
 * @property duration - The ISO 8601 duration of when to fire the background event.
 * @property request - The request to be called when the event fires.
 */
export type ScheduleBackgroundEventParams =
  | {
      date: string;
      request: Cronjob['request'];
    }
  | { duration: string; request: Cronjob['request'] };

/**
 * The ID of the scheduled background event.
 */
export type ScheduleBackgroundEventResult = string;

import type { Cronjob } from '../permissions';

/**
 * The request parameters for the `snap_scheduleBackgroundEvent` method.
 *
 * Note: The date generated from a duration will be represented in UTC.
 *
 * @property date - The ISO 8601 date/duration of when to fire the background event.
 * @property request - The request to be called when the event fires.
 */
export type ScheduleBackgroundEventParams = {
  date: string;
  request: Cronjob['request'];
};

/**
 * The result returned by the `snap_scheduleBackgroundEvent` method, which is the ID of the scheduled event.
 */
export type ScheduleBackgroundEventResult = string;

import type { Cronjob } from '../permissions';

/**
 * The request parameters for the `snap_scheduleBackgroundEvent` method.
 *
 * @property date - The ISO8601 date of when to fire the background event.
 * @property request - The request to be called when the event fires.
 */
export type ScheduleBackgroundEventParams = {
  date: string;
  request: Cronjob['request'];
};

/**
 * The result returned by the `snap_scheduleBackgroundEvent` method.
 */
export type ScheduleBackgroundEventResult = string;

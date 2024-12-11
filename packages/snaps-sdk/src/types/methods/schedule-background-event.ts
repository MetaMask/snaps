import type { Cronjob } from '../permissions';

/**
 * Params for the `snap_scheduleBackgroundEvent` method.
 */
export type ScheduleBackgroundEventParams = {
  date: string;
  request: Cronjob['request'];
};

/**
 * `snap_scheduleBackgroundEvent` return type.
 */
export type ScheduleBackgroundEventResult = string;

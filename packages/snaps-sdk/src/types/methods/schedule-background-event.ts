import type { Cronjob } from '../permissions';

export type ScheduleBackgroundEventParams = {
  date: string;
  request: Cronjob['request'];
};

export type ScheduleBackgroundEventResult = string;

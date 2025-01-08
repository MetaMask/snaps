import type { Json } from '@metamask/utils';

import type { SnapId } from '../snap';

/**
 * Background event type
 *
 * Note: The date generated when scheduling an event with a duration will be represented in UTC.
 *
 * @property id - The unique id representing the event.
 * @property scheduledAt - The ISO 8601 time stamp of when the event was scheduled.
 * @property snapId - The id of the snap that scheduled the event.
 * @property date - The ISO 8601 date of when the event is scheduled for.
 * @property request - The request that is supplied to the `onCronjob` handler when the event is fired.
 */
export type BackgroundEvent = {
  id: string;
  scheduledAt: string;
  snapId: SnapId;
  date: string;
  request: {
    method: string;
    jsonrpc?: '2.0' | undefined;
    id?: string | number | null | undefined;
    params?: Json[] | Record<string, Json> | undefined;
  };
};

/**
 * The result returned by the `snap_getBackgroundEvents` method.
 *
 * It consists of an array background events (if any) for a snap.
 */
export type GetBackgroundEventsResult = BackgroundEvent[];

/**
 * The request parameters for the `snap_getBackgroundEvents` method.
 *
 * This method does not accept any parameters.
 */
export type GetBackgroundEventsParams = never;

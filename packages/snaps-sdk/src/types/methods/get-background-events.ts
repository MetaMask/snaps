import type { Json } from '@metamask/utils';

import type { SnapId } from '../snap';

/**
 * Background event type.
 *
 * Note: The date generated when scheduling an event with a duration will be
 * represented in UTC.
 *
 * @property id - The unique id representing the event.
 * @property scheduledAt - The ISO 8601 time stamp of when the event was
 * scheduled.
 * @property snapId - The id of the snap that scheduled the event.
 * @property date - The ISO 8601 date of when the event is scheduled for.
 * @property request - The request that is supplied to the `onCronjob` handler
 * when the event is fired.
 */
export type BackgroundEvent = {
  id: string;
  scheduledAt: string;
  snapId: SnapId;
  date: string;
  request: {
    /**
     * The method to be called when the event is fired.
     */
    method: string;

    /**
     * The optional JSON-RPC version for the request, which is always "2.0" if
     * provided.
     */
    jsonrpc?: '2.0' | undefined;

    /**
     * The optional ID for the request.
     */
    id?: string | number | null | undefined;

    /**
     * The optional parameters for the request.
     */
    params?: Json[] | Record<string, Json> | undefined;
  };
};

/**
 * An array of scheduled background events.
 */
export type GetBackgroundEventsResult = BackgroundEvent[];

/**
 * This method does not accept any parameters.
 */
export type GetBackgroundEventsParams = never;

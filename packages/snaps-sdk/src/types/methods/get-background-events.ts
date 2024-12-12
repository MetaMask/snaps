import type { Json } from '@metamask/utils';

import type { SnapId } from '../snap';

/**
 * Backgound event type
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

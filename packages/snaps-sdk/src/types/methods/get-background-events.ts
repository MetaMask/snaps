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
 * `snap_getBackgroundEvents` result type.
 */
export type GetBackgroundEventsResult = BackgroundEvent[];

/**
 * `snao_getBackgroundEvents` params.
 */
export type GetBackgroundEventsParams = never;

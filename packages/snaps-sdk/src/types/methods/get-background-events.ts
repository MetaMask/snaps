import type { Json } from '@metamask/utils';

import type { SnapId } from '../snap';

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

export type GetBackgroundEventsResult = BackgroundEvent[];

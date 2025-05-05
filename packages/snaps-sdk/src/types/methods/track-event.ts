import type { Json } from '@metamask/utils';

/**
 * The parameters for the `snap_trackEvent` method.
 */
export type TrackEventParams = {
  event: {
    /**
     * The name of the event to track.
     */
    event: string;

    /**
     * Custom values to track.
     */
    properties?: Record<string, Json>;

    /**
     * Sensitive values to track.
     */
    sensitiveProperties?: Record<string, Json>;
  };
};

export type TrackEventResult = null;

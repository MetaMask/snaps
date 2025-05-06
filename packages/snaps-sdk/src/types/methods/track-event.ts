import type { Json } from '@metamask/utils';

/**
 * The parameters for the `snap_trackEvent` method.
 *
 * @property event - Primary payload object containing other metrics properties.
 * @property event.event - The name of the event to track.
 * @property event.properties - Custom values to track.
 * @property event.sensitiveProperties - Sensitive values to track.
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

/**
 * The result returned by the `snap_trackEvent` method.
 */
export type TrackEventResult = null;

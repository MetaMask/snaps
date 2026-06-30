import type { Json } from '@metamask/utils';

/**
 * The request parameters for the `snap_messengerCall` method. This method is used
 * to call an action on the messenger.
 *
 * Note that this method is only available to preinstalled Snaps.
 */
export type MessengerCallParams = {
  action: `${string}:${string}`;
  params: Json[];
};

/**
 * The result returned by the `snap_messengerCall` method.
 */
export type MessengerCallResult = Json;

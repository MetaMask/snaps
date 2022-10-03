import { Infer, is, literal, object, string, unknown } from 'superstruct';
import { ChainIdStruct } from './namespace';
import { assertStruct } from './assert';

export const EventStruct = object({
  name: string(),
  data: unknown(),
});

export type Event = Infer<typeof EventStruct>;

/**
 * Check if a value is a SIP-2 event.
 *
 * @param value - The value to check.
 * @returns Whether the value is a SIP-2 event.
 */
export function isEvent(value: unknown): value is Event {
  return is(value, EventStruct);
}

/**
 * Assert that a value is a SIP-2 event.
 *
 * @param value - The value to check.
 * @throws If the value is not a SIP-2 event.
 */
export function assertIsEvent(value: unknown): asserts value is Event {
  assertStruct(value, EventStruct, 'Invalid event');
}

export const MetaMaskNotificationStruct = object({
  method: literal('multichainHack_metamask_event'),
  params: object({
    chainId: ChainIdStruct,
    event: EventStruct,
  }),
});

export type MetaMaskNotification = Infer<typeof MetaMaskNotificationStruct>;

/**
 * Check if a value is a SIP-2 notification.
 *
 * @param value - The value to check.
 * @returns Whether the value is a SIP-2 notification.
 */
export function isMetaMaskNotification(
  value: unknown,
): value is MetaMaskNotification {
  return is(value, MetaMaskNotificationStruct);
}

/**
 * Assert that a value is a SIP-2 notification.
 *
 * @param value - The value to check.
 * @throws If the value is not a SIP-2 notification.
 */
export function assertIsMetaMaskNotification(
  value: unknown,
): asserts value is MetaMaskNotification {
  assertStruct(value, MetaMaskNotificationStruct, 'Invalid notification');
}

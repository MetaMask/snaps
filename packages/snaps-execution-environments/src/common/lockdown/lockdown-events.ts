// When creating a sandbox, limitation of the events from leaking
// sensitive objects is required. This is done by overriding own properties
// of prototypes of all existing events.

import { hasProperty } from '@metamask/utils';

/**
 * Targeted Event objects and properties.
 * Note: This is a map of the prototypes that inherit from Events with
 * properties that are identified to leak sensitive objects.
 */
export const targetEvents: { [index: string]: any } = Object.freeze({
  UIEvent: ['view'],
  MutationEvent: ['relatedNode'],
  MessageEvent: ['source'],
  FocusEvent: ['relatedTarget'],
  MouseEvent: ['relatedTarget', 'fromElement', 'toElement'],
  TouchEvent: ['targetTouches', 'touches'],
  Event: ['target', 'currentTarget', 'srcElement', 'composedPath'],
});

/**
 * Attenuate Event objects by replacing its own properties.
 */
export function executeLockdownEvents() {
  Object.keys(targetEvents).forEach((event) => {
    const properties = targetEvents[event];
    for (const property of properties) {
      if (hasProperty(globalThis, event)) {
        Object.defineProperty(
          globalThis[event as keyof typeof globalThis].prototype,
          property,
          {
            value: undefined,
            configurable: false,
            writable: false,
          },
        );
      }
    }
  });
}

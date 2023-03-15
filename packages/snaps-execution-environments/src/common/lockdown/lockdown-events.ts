// When creating a sandbox, limitation of the events from leaking
// sensitive objects is required. This is done by overriding own properties
// of prototypes of all existing events.
import { hasProperty } from '@metamask/utils';

/**
 * Targeted Event objects and properties.
 * Note: This is a map of the prototypes that inherit from Events with
 * properties that are identified to leak sensitive objects.
 * Not all browsers support all event types, so checking its existence is required.
 */
const targetEvents = new Map();
if (hasProperty(globalThis, 'UIEvent')) {
  targetEvents.set(UIEvent.prototype, ['view']);
}
if (hasProperty(globalThis, 'MutationEvent')) {
  targetEvents.set(MutationEvent.prototype, ['relatedNode']);
}
if (hasProperty(globalThis, 'MessageEvent')) {
  targetEvents.set(MessageEvent.prototype, ['source']);
}
if (hasProperty(globalThis, 'FocusEvent')) {
  targetEvents.set(FocusEvent.prototype, ['relatedTarget']);
}
if (hasProperty(globalThis, 'MouseEvent')) {
  targetEvents.set(MouseEvent.prototype, [
    'relatedTarget',
    'fromElement',
    'toElement',
  ]);
}
if (hasProperty(globalThis, 'TouchEvent')) {
  targetEvents.set(TouchEvent.prototype, ['targetTouches', 'touches']);
}
if (hasProperty(globalThis, 'Event')) {
  targetEvents.set(Event.prototype, [
    'target',
    'currentTarget',
    'srcElement',
    'composedPath',
  ]);
}

/**
 * Attenuate Event objects by replacing its own properties.
 */
export function executeLockdownEvents() {
  targetEvents.forEach((properties, prototype) => {
    for (const property of properties) {
      Object.defineProperty(prototype, property, {
        value: undefined,
        configurable: false,
        writable: false,
      });
    }
  });
}

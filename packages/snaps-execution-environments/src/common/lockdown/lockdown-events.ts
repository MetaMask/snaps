// When creating a sandbox, limitation of the events from leaking
// sensitive objects is required. This is done by overriding own properties
// of prototypes of all existing events.

/**
 * Targeted Event objects and properties.
 * Note: This is a map of the prototypes that inherit from Events with
 * properties that are identified to leak sensitive objects.
 */

const targetEvents = new Map();
targetEvents.set(UIEvent.prototype, ['view'])
targetEvents.set(MutationEvent.prototype, ['relatedNode'])
targetEvents.set(MessageEvent.prototype, ['source'])
targetEvents.set(FocusEvent.prototype, ['relatedTarget'])
targetEvents.set(MouseEvent.prototype, ['relatedTarget', 'fromElement', 'toElement'])
targetEvents.set(TouchEvent.prototype, ['targetTouches', 'touches'])
targetEvents.set(Event.prototype, ['target', 'currentTarget', 'srcElement', 'composedPath'])

/**
 * Attenuate Event objects by replacing its own properties.
 */
export function executeLockdownEvents() {
  targetEvents.forEach((properties, prototype) => {
    for (const property of properties) {
      Object.defineProperty(
        prototype,
        property,
        {
          value: undefined,
          configurable: false,
          writable: false,
        },
      );
    }
  });
}

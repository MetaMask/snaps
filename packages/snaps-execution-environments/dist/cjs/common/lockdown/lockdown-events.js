// When creating a sandbox, limitation of the events from leaking
// sensitive objects is required. This is done by overriding own properties
// of prototypes of all existing events.
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "executeLockdownEvents", {
    enumerable: true,
    get: function() {
        return executeLockdownEvents;
    }
});
const _utils = require("@metamask/utils");
/**
 * Targeted Event objects and properties.
 * Note: This is a map of the prototypes that inherit from Events with
 * properties that are identified to leak sensitive objects.
 * Not all browsers support all event types, so checking its existence is required.
 */ const targetEvents = new Map();
if ((0, _utils.hasProperty)(globalThis, 'UIEvent')) {
    targetEvents.set(UIEvent.prototype, [
        'view'
    ]);
}
if ((0, _utils.hasProperty)(globalThis, 'MutationEvent')) {
    targetEvents.set(MutationEvent.prototype, [
        'relatedNode'
    ]);
}
if ((0, _utils.hasProperty)(globalThis, 'MessageEvent')) {
    targetEvents.set(MessageEvent.prototype, [
        'source'
    ]);
}
if ((0, _utils.hasProperty)(globalThis, 'FocusEvent')) {
    targetEvents.set(FocusEvent.prototype, [
        'relatedTarget'
    ]);
}
if ((0, _utils.hasProperty)(globalThis, 'MouseEvent')) {
    targetEvents.set(MouseEvent.prototype, [
        'relatedTarget',
        'fromElement',
        'toElement'
    ]);
}
if ((0, _utils.hasProperty)(globalThis, 'TouchEvent')) {
    targetEvents.set(TouchEvent.prototype, [
        'targetTouches',
        'touches'
    ]);
}
if ((0, _utils.hasProperty)(globalThis, 'Event')) {
    targetEvents.set(Event.prototype, [
        'target',
        'currentTarget',
        'srcElement',
        'composedPath'
    ]);
}
function executeLockdownEvents() {
    targetEvents.forEach((properties, prototype)=>{
        for (const property of properties){
            Object.defineProperty(prototype, property, {
                value: undefined,
                configurable: false,
                writable: false
            });
        }
    });
}

//# sourceMappingURL=lockdown-events.js.map
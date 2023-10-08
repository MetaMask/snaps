// eslint-disable-next-line @typescript-eslint/triple-slash-reference, spaced-comment
/// <reference path="../../../../../node_modules/ses/types.d.ts" />
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "executeLockdownMore", {
    enumerable: true,
    get: function() {
        return executeLockdownMore;
    }
});
const _snapsutils = require("@metamask/snaps-utils");
function executeLockdownMore() {
    // Make all "object" and "function" own properties of globalThis
    // non-configurable and non-writable, when possible.
    // We call a property that is non-configurable and non-writable,
    // "non-modifiable".
    try {
        const namedIntrinsics = Reflect.ownKeys(new Compartment().globalThis);
        // These named intrinsics are not automatically hardened by `lockdown`
        const shouldHardenManually = new Set([
            'eval',
            'Function'
        ]);
        const globalProperties = new Set([
            // universalPropertyNames is a constant added by lockdown to global scope
            // at the time of writing, it is initialized in 'ses/src/whitelist'.
            // These properties tend to be non-enumerable.
            ...namedIntrinsics
        ]);
        globalProperties.forEach((propertyName)=>{
            const descriptor = Reflect.getOwnPropertyDescriptor(globalThis, propertyName);
            if (descriptor) {
                if (descriptor.configurable) {
                    // If the property on globalThis is configurable, make it
                    // non-configurable. If it has no accessor properties, also make it
                    // non-writable.
                    if (hasAccessor(descriptor)) {
                        Object.defineProperty(globalThis, propertyName, {
                            configurable: false
                        });
                    } else {
                        Object.defineProperty(globalThis, propertyName, {
                            configurable: false,
                            writable: false
                        });
                    }
                }
                if (shouldHardenManually.has(propertyName)) {
                    harden(globalThis[propertyName]);
                }
            }
        });
    } catch (error) {
        (0, _snapsutils.logError)('Protecting intrinsics failed:', error);
        throw error;
    }
}
/**
 * Checks whether the given propertyName descriptor has any accessors, i.e. the
 * properties `get` or `set`.
 *
 * We want to make globals non-writable, and we can't set the `writable`
 * property and accessor properties at the same time.
 *
 * @param descriptor - The propertyName descriptor to check.
 * @returns Whether the propertyName descriptor has any accessors.
 */ function hasAccessor(descriptor) {
    return 'set' in descriptor || 'get' in descriptor;
}

//# sourceMappingURL=lockdown-more.js.map
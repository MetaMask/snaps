import { rootRealmGlobal } from './globalObject';
/**
 * Adds an event listener platform agnostically, trying both `globalThis.addEventListener` and `globalThis.process.on`
 *
 * @param event - The event to listen for.
 * @param listener - The listener to be triggered when the event occurs.
 * @returns The result of the platform agnostic operation if any.
 * @throws If none of the platform options are present.
 */ export function addEventListener(event, listener) {
    if ('addEventListener' in rootRealmGlobal && typeof rootRealmGlobal.addEventListener === 'function') {
        return rootRealmGlobal.addEventListener(event.toLowerCase(), listener);
    }
    if (rootRealmGlobal.process && 'on' in rootRealmGlobal.process && typeof rootRealmGlobal.process.on === 'function') {
        return rootRealmGlobal.process.on(event, listener);
    }
    throw new Error('Platform agnostic addEventListener failed');
}
/**
 * Removes an event listener platform agnostically, trying both `globalThis.removeEventListener` and `globalThis.process.removeListener`
 *
 * @param event - The event to remove the listener for.
 * @param listener - The currently attached listener.
 * @returns The result of the platform agnostic operation if any.
 * @throws If none of the platform options are present.
 */ export function removeEventListener(event, listener) {
    if ('removeEventListener' in rootRealmGlobal && typeof rootRealmGlobal.removeEventListener === 'function') {
        return rootRealmGlobal.removeEventListener(event.toLowerCase(), listener);
    }
    if (rootRealmGlobal.process && 'removeListener' in rootRealmGlobal.process && typeof rootRealmGlobal.process.removeListener === 'function') {
        return rootRealmGlobal.process.removeListener(event, listener);
    }
    throw new Error('Platform agnostic removeEventListener failed');
}

//# sourceMappingURL=globalEvents.js.map
/// <reference types="webpack-env" />
/// <reference types="node" />
/**
 * Adds an event listener platform agnostically, trying both `globalThis.addEventListener` and `globalThis.process.on`
 *
 * @param event - The event to listen for.
 * @param listener - The listener to be triggered when the event occurs.
 * @returns The result of the platform agnostic operation if any.
 * @throws If none of the platform options are present.
 */
export declare function addEventListener(event: string, listener: (...args: any[]) => void): void | NodeJS.Process;
/**
 * Removes an event listener platform agnostically, trying both `globalThis.removeEventListener` and `globalThis.process.removeListener`
 *
 * @param event - The event to remove the listener for.
 * @param listener - The currently attached listener.
 * @returns The result of the platform agnostic operation if any.
 * @throws If none of the platform options are present.
 */
export declare function removeEventListener(event: string, listener: (...args: any[]) => void): void | NodeJS.Process;

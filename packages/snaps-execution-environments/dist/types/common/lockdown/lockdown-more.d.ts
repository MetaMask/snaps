/// <reference types="ses" />
/**
 * The SES `lockdown` function only hardens the properties enumerated by the
 * universalPropertyNames constant specified in 'ses/src/whitelist'. This
 * function makes all function and object properties on the start compartment
 * global non-configurable and non-writable, unless they are already
 * non-configurable.
 *
 * It is critical that this function runs at the right time during
 * initialization, which should always be immediately after `lockdown` has been
 * called. At the time of writing, the modifications this function makes to the
 * runtime environment appear to be non-breaking, but that could change with
 * the addition of dependencies, or the order of our scripts in our HTML files.
 * Exercise caution.
 *
 * See inline comments for implementation details.
 *
 * We write this function in IIFE format to avoid polluting global scope.
 *
 * @throws If the lockdown failed.
 */
export declare function executeLockdownMore(): void;

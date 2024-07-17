import type { SimulationOptions } from '../../options';
/**
 * Get the implementation of the `getLocale` hook.
 *
 * @param options - The simulation options.
 * @param options.locale - The locale to use.
 * @returns The implementation of the `getLocale` hook.
 */
export declare function getGetLocaleMethodImplementation({ locale, }: SimulationOptions): () => Promise<string>;

import type { Infer } from '@metamask/superstruct';
declare const SimulationOptionsStruct: import("@metamask/superstruct").Struct<{
    state?: Record<string, import("@metamask/utils").Json> | null | undefined;
    locale?: string | undefined;
    secretRecoveryPhrase?: string | undefined;
    unencryptedState?: Record<string, import("@metamask/utils").Json> | null | undefined;
}, {
    secretRecoveryPhrase: import("@metamask/superstruct").Struct<string | undefined, null>;
    locale: import("@metamask/superstruct").Struct<string | undefined, null>;
    state: import("@metamask/superstruct").Struct<Record<string, import("@metamask/utils").Json> | null | undefined, null>;
    unencryptedState: import("@metamask/superstruct").Struct<Record<string, import("@metamask/utils").Json> | null | undefined, null>;
}>;
/**
 * Options for the simulation.
 *
 * @property secretRecoveryPhrase - The secret recovery phrase to use. This is
 * used to derive addresses and private keys. Defaults to a test recovery
 * phrase.
 * @property locale - The locale to use. Defaults to `en`.
 * @property state - The initial state of the Snap, if any. Defaults to `null`.
 */
export declare type SimulationUserOptions = Infer<typeof SimulationOptionsStruct>;
/**
 * Options for the simulation, with defaults filled in.
 *
 * See {@link SimulationUserOptions} for documentation.
 */
export declare type SimulationOptions = Required<SimulationUserOptions>;
/**
 * Get the options for the simulation.
 *
 * @param options - The user options. Any options not specified will be filled
 * in with default values.
 * @returns The simulation options.
 */
export declare function getOptions(options: SimulationUserOptions): SimulationOptions;
export {};

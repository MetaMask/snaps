import type { PermissionSpecificationBuilder, RestrictedMethodOptions } from '@metamask/permission-controller';
import { PermissionType } from '@metamask/permission-controller';
import type { Hex, NonEmptyArray } from '@metamask/utils';
import type { Infer } from 'superstruct';
import type { MethodHooksObject } from '../utils';
declare const targetName = "snap_getEntropy";
declare type GetEntropySpecificationBuilderOptions = {
    allowedCaveats?: Readonly<NonEmptyArray<string>> | null;
    methodHooks: GetEntropyHooks;
};
export declare const GetEntropyArgsStruct: import("superstruct").Struct<{
    version: 1;
    salt?: string | undefined;
}, {
    version: import("superstruct").Struct<1, 1>;
    salt: import("superstruct").Struct<string | undefined, null>;
}>;
/**
 * @property version - The version of the `snap_getEntropy` method. This must be
 * the numeric literal `1`.
 * @property salt - A string to use as the salt when deriving the entropy. If
 * omitted, the salt will be an empty string.
 */
export declare type GetEntropyArgs = Infer<typeof GetEntropyArgsStruct>;
export declare const getEntropyBuilder: Readonly<{
    readonly targetName: "snap_getEntropy";
    readonly specificationBuilder: PermissionSpecificationBuilder<PermissionType.RestrictedMethod, GetEntropySpecificationBuilderOptions, {
        permissionType: PermissionType.RestrictedMethod;
        targetName: typeof targetName;
        methodImplementation: ReturnType<typeof getEntropyImplementation>;
        allowedCaveats: Readonly<NonEmptyArray<string>> | null;
    }>;
    readonly methodHooks: MethodHooksObject<GetEntropyHooks>;
}>;
export declare type GetEntropyHooks = {
    /**
     * @returns The mnemonic of the user's primary keyring.
     */
    getMnemonic: () => Promise<Uint8Array>;
    /**
     * Waits for the extension to be unlocked.
     *
     * @returns A promise that resolves once the extension is unlocked.
     */
    getUnlockPromise: (shouldShowUnlockRequest: boolean) => Promise<void>;
};
/**
 * Builds the method implementation for `snap_getEntropy`. The implementation
 * is based on the reference implementation of
 * [SIP-6](https://metamask.github.io/SIPs/SIPS/sip-6).
 *
 * @param hooks - The RPC method hooks.
 * @param hooks.getMnemonic - The method to get the mnemonic of the user's
 * primary keyring.
 * @param hooks.getUnlockPromise - The method to get a promise that resolves
 * once the extension is unlocked.
 * @returns The method implementation.
 */
declare function getEntropyImplementation({ getMnemonic, getUnlockPromise, }: GetEntropyHooks): (options: RestrictedMethodOptions<GetEntropyArgs>) => Promise<Hex>;
export {};

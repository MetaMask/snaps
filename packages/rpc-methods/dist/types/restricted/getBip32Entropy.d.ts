import type { JsonSLIP10Node } from '@metamask/key-tree';
import type { PermissionSpecificationBuilder, PermissionValidatorConstraint, RestrictedMethodOptions } from '@metamask/permission-controller';
import { PermissionType } from '@metamask/permission-controller';
import type { Bip32Entropy } from '@metamask/snaps-utils';
import type { NonEmptyArray } from '@metamask/utils';
import type { MethodHooksObject } from '../utils';
declare const targetName = "snap_getBip32Entropy";
export declare type GetBip32EntropyMethodHooks = {
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
declare type GetBip32EntropySpecificationBuilderOptions = {
    methodHooks: GetBip32EntropyMethodHooks;
};
export declare const getBip32EntropyBuilder: Readonly<{
    readonly targetName: "snap_getBip32Entropy";
    readonly specificationBuilder: PermissionSpecificationBuilder<PermissionType.RestrictedMethod, GetBip32EntropySpecificationBuilderOptions, {
        permissionType: PermissionType.RestrictedMethod;
        targetName: typeof targetName;
        methodImplementation: ReturnType<typeof getBip32EntropyImplementation>;
        allowedCaveats: Readonly<NonEmptyArray<string>> | null;
        validator: PermissionValidatorConstraint;
    }>;
    readonly methodHooks: MethodHooksObject<GetBip32EntropyMethodHooks>;
}>;
/**
 * Builds the method implementation for `snap_getBip32Entropy`.
 *
 * @param hooks - The RPC method hooks.
 * @param hooks.getMnemonic - A function to retrieve the Secret Recovery Phrase of the user.
 * @param hooks.getUnlockPromise - A function that resolves once the MetaMask extension is unlocked
 * and prompts the user to unlock their MetaMask if it is locked.
 * @returns The method implementation which returns a `JsonSLIP10Node`.
 * @throws If the params are invalid.
 */
export declare function getBip32EntropyImplementation({ getMnemonic, getUnlockPromise, }: GetBip32EntropyMethodHooks): (args: RestrictedMethodOptions<Bip32Entropy>) => Promise<JsonSLIP10Node>;
export {};

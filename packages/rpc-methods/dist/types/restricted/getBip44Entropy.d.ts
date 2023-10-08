import type { JsonBIP44CoinTypeNode } from '@metamask/key-tree';
import type { PermissionSpecificationBuilder, PermissionValidatorConstraint, RestrictedMethodOptions } from '@metamask/permission-controller';
import { PermissionType } from '@metamask/permission-controller';
import type { NonEmptyArray } from '@metamask/utils';
import type { MethodHooksObject } from '../utils';
declare const targetName = "snap_getBip44Entropy";
export declare type GetBip44EntropyMethodHooks = {
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
declare type GetBip44EntropySpecificationBuilderOptions = {
    methodHooks: GetBip44EntropyMethodHooks;
};
export declare type GetBip44EntropyParams = {
    coinType: number;
};
export declare const getBip44EntropyBuilder: Readonly<{
    readonly targetName: "snap_getBip44Entropy";
    readonly specificationBuilder: PermissionSpecificationBuilder<PermissionType.RestrictedMethod, GetBip44EntropySpecificationBuilderOptions, {
        permissionType: PermissionType.RestrictedMethod;
        targetName: typeof targetName;
        methodImplementation: ReturnType<typeof getBip44EntropyImplementation>;
        allowedCaveats: Readonly<NonEmptyArray<string>> | null;
        validator: PermissionValidatorConstraint;
    }>;
    readonly methodHooks: MethodHooksObject<GetBip44EntropyMethodHooks>;
}>;
/**
 * Builds the method implementation for `snap_getBip44Entropy`.
 *
 * @param hooks - The RPC method hooks.
 * @param hooks.getMnemonic - A function to retrieve the Secret Recovery Phrase
 * of the user.
 * @param hooks.getUnlockPromise - A function that resolves once the MetaMask
 * extension is unlocked and prompts the user to unlock their MetaMask if it is
 * locked.
 * @returns The method implementation which returns a `BIP44CoinTypeNode`.
 * @throws If the params are invalid.
 */
export declare function getBip44EntropyImplementation({ getMnemonic, getUnlockPromise, }: GetBip44EntropyMethodHooks): (args: RestrictedMethodOptions<GetBip44EntropyParams>) => Promise<JsonBIP44CoinTypeNode>;
export {};

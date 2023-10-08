import type { PermissionSpecificationBuilder, PermissionValidatorConstraint, RestrictedMethodOptions } from '@metamask/permission-controller';
import { PermissionType } from '@metamask/permission-controller';
import type { NonEmptyArray } from '@metamask/utils';
import type { MethodHooksObject } from '../utils';
declare const targetName = "snap_getBip32PublicKey";
export declare type GetBip32PublicKeyMethodHooks = {
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
declare type GetBip32PublicKeySpecificationBuilderOptions = {
    methodHooks: GetBip32PublicKeyMethodHooks;
};
declare type GetBip32PublicKeyParameters = {
    path: ['m', ...(`${number}` | `${number}'`)[]];
    curve: 'secp256k1' | 'ed25519';
    compressed?: boolean;
};
export declare const Bip32PublicKeyArgsStruct: import("superstruct").Struct<{
    path: string[];
    curve: "ed25519" | "secp256k1";
    compressed?: boolean | undefined;
}, {
    path: import("superstruct").Struct<string[], import("superstruct").Struct<string, null>>;
    curve: import("superstruct").Struct<"ed25519" | "secp256k1", {
        ed25519: "ed25519";
        secp256k1: "secp256k1";
    }>;
    compressed: import("superstruct").Struct<boolean | undefined, null>;
}>;
export declare const getBip32PublicKeyBuilder: Readonly<{
    readonly targetName: "snap_getBip32PublicKey";
    readonly specificationBuilder: PermissionSpecificationBuilder<PermissionType.RestrictedMethod, GetBip32PublicKeySpecificationBuilderOptions, {
        permissionType: PermissionType.RestrictedMethod;
        targetName: typeof targetName;
        methodImplementation: ReturnType<typeof getBip32PublicKeyImplementation>;
        allowedCaveats: Readonly<NonEmptyArray<string>> | null;
        validator: PermissionValidatorConstraint;
    }>;
    readonly methodHooks: MethodHooksObject<GetBip32PublicKeyMethodHooks>;
}>;
/**
 * Builds the method implementation for `snap_getBip32PublicKey`.
 *
 * @param hooks - The RPC method hooks.
 * @param hooks.getMnemonic - A function to retrieve the Secret Recovery Phrase of the user.
 * @param hooks.getUnlockPromise - A function that resolves once the MetaMask extension is unlocked
 * and prompts the user to unlock their MetaMask if it is locked.
 * @returns The method implementation which returns a public key.
 * @throws If the params are invalid.
 */
export declare function getBip32PublicKeyImplementation({ getMnemonic, getUnlockPromise, }: GetBip32PublicKeyMethodHooks): (args: RestrictedMethodOptions<GetBip32PublicKeyParameters>) => Promise<string>;
export {};

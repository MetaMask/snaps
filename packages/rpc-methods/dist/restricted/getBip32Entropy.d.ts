import { PermissionSpecificationBuilder, PermissionType, RestrictedMethodOptions, Caveat, PermissionValidatorConstraint, PermissionConstraint, RestrictedMethodCaveatSpecificationConstraint } from '@metamask/controllers';
import { Json, NonEmptyArray } from '@metamask/utils';
import { JsonSLIP10Node } from '@metamask/key-tree';
import { SnapCaveatType } from '@metamask/snap-utils';
declare const targetKey = "snap_getBip32Entropy";
export declare type GetBip32EntropyMethodHooks = {
    /**
     * @returns The mnemonic of the user's primary keyring.
     */
    getMnemonic: () => Promise<string>;
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
declare type GetBip32EntropyParameters = {
    path: ['m', ...(`${number}` | `${number}'`)[]];
    curve: 'secp256k1' | 'ed25519';
};
/**
 * Validate a caveat path object. The object must consist of a `path` array and
 * optionally a `curve` string. Paths must start with `m`, and must contain at
 * least two indices. If `ed25519` is used, this checks if all the path indices
 * are hardened.
 *
 * @param value - The value to validate.
 * @throws If the value is invalid.
 */
export declare function validatePath(value: unknown): asserts value is GetBip32EntropyParameters;
/**
 * Validate the path values associated with a caveat. This validates that the
 * value is a non-empty array with valid derivation paths and curves.
 *
 * @param caveat - The caveat to validate.
 * @throws If the value is invalid.
 */
export declare function validateCaveatPaths(caveat: Caveat<string, any>): void;
export declare const getBip32EntropyBuilder: Readonly<{
    readonly targetKey: "snap_getBip32Entropy";
    readonly specificationBuilder: PermissionSpecificationBuilder<PermissionType.RestrictedMethod, GetBip32EntropySpecificationBuilderOptions, {
        permissionType: PermissionType.RestrictedMethod;
        targetKey: typeof targetKey;
        methodImplementation: ReturnType<typeof getBip32EntropyImplementation>;
        allowedCaveats: Readonly<NonEmptyArray<string>> | null;
        validator: PermissionValidatorConstraint;
    }>;
    readonly methodHooks: {
        readonly getMnemonic: true;
        readonly getUnlockPromise: true;
    };
}>;
/**
 * Map a raw value from the `initialPermissions` to a caveat specification.
 * Note that this function does not do any validation, that's handled by the
 * PermissionsController when the permission is requested.
 *
 * @param value - The raw value from the `initialPermissions`.
 * @returns The caveat specification.
 */
export declare function getBip32EntropyCaveatMapper(value: Json): Pick<PermissionConstraint, 'caveats'>;
export declare const getBip32EntropyCaveatSpecifications: Record<SnapCaveatType.PermittedDerivationPaths, RestrictedMethodCaveatSpecificationConstraint>;
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
export declare function getBip32EntropyImplementation({ getMnemonic, getUnlockPromise, }: GetBip32EntropyMethodHooks): (args: RestrictedMethodOptions<GetBip32EntropyParameters>) => Promise<JsonSLIP10Node>;
export {};

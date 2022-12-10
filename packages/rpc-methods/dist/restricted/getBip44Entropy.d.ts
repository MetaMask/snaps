import { Caveat, PermissionSpecificationBuilder, PermissionType, PermissionValidatorConstraint, RestrictedMethodOptions, PermissionConstraint, RestrictedMethodCaveatSpecificationConstraint } from '@metamask/controllers';
import { JsonBIP44CoinTypeNode } from '@metamask/key-tree';
import { Json, NonEmptyArray } from '@metamask/utils';
import { SnapCaveatType } from '@metamask/snap-utils';
declare const targetKey = "snap_getBip44Entropy";
export declare type GetBip44EntropyMethodHooks = {
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
declare type GetBip44EntropySpecificationBuilderOptions = {
    methodHooks: GetBip44EntropyMethodHooks;
};
declare type GetBip44EntropyParams = {
    coinType: number;
};
/**
 * Validate the params for `snap_getBip44Entropy`.
 *
 * @param value - The params to validate.
 * @throws If the params are invalid.
 */
export declare function validateParams(value: unknown): asserts value is GetBip44EntropyParams;
/**
 * Validate the coin types values associated with a caveat. This checks if the
 * values are non-negative integers (>= 0).
 *
 * @param caveat - The caveat to validate.
 * @throws If the caveat is invalid.
 */
export declare function validateCaveat(caveat: Caveat<string, any>): void;
export declare const getBip44EntropyBuilder: Readonly<{
    readonly targetKey: "snap_getBip44Entropy";
    readonly specificationBuilder: PermissionSpecificationBuilder<PermissionType.RestrictedMethod, GetBip44EntropySpecificationBuilderOptions, {
        permissionType: PermissionType.RestrictedMethod;
        targetKey: typeof targetKey;
        methodImplementation: ReturnType<typeof getBip44EntropyImplementation>;
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
export declare function getBip44EntropyCaveatMapper(value: Json): Pick<PermissionConstraint, 'caveats'>;
export declare const getBip44EntropyCaveatSpecifications: Record<SnapCaveatType.PermittedCoinTypes, RestrictedMethodCaveatSpecificationConstraint>;
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

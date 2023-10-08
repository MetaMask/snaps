import { PermissionType, SubjectType } from '@metamask/permission-controller';
import { SnapCaveatType } from '@metamask/snaps-utils';
import { assert } from '@metamask/utils';
import { ethErrors } from 'eth-rpc-errors';
import { getNode } from '../utils';
const targetName = 'snap_getBip32Entropy';
/**
 * The specification builder for the `snap_getBip32Entropy` permission.
 * `snap_getBip32Entropy` lets the Snap control private keys for a particular
 * BIP-32 node.
 *
 * @param options - The specification builder options.
 * @param options.methodHooks - The RPC method hooks needed by the method implementation.
 * @returns The specification for the `snap_getBip32Entropy` permission.
 */ const specificationBuilder = ({ methodHooks })=>{
    return {
        permissionType: PermissionType.RestrictedMethod,
        targetName,
        allowedCaveats: [
            SnapCaveatType.PermittedDerivationPaths
        ],
        methodImplementation: getBip32EntropyImplementation(methodHooks),
        validator: ({ caveats })=>{
            if (caveats?.length !== 1 || caveats[0].type !== SnapCaveatType.PermittedDerivationPaths) {
                throw ethErrors.rpc.invalidParams({
                    message: `Expected a single "${SnapCaveatType.PermittedDerivationPaths}" caveat.`
                });
            }
        },
        subjectTypes: [
            SubjectType.Snap
        ]
    };
};
const methodHooks = {
    getMnemonic: true,
    getUnlockPromise: true
};
export const getBip32EntropyBuilder = Object.freeze({
    targetName,
    specificationBuilder,
    methodHooks
});
/**
 * Builds the method implementation for `snap_getBip32Entropy`.
 *
 * @param hooks - The RPC method hooks.
 * @param hooks.getMnemonic - A function to retrieve the Secret Recovery Phrase of the user.
 * @param hooks.getUnlockPromise - A function that resolves once the MetaMask extension is unlocked
 * and prompts the user to unlock their MetaMask if it is locked.
 * @returns The method implementation which returns a `JsonSLIP10Node`.
 * @throws If the params are invalid.
 */ export function getBip32EntropyImplementation({ getMnemonic, getUnlockPromise }) {
    return async function getBip32Entropy(args) {
        await getUnlockPromise(true);
        const { params } = args;
        assert(params);
        const node = await getNode({
            curve: params.curve,
            path: params.path,
            secretRecoveryPhrase: await getMnemonic()
        });
        return node.toJSON();
    };
}

//# sourceMappingURL=getBip32Entropy.js.map
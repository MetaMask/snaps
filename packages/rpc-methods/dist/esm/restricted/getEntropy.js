import { PermissionType, SubjectType } from '@metamask/permission-controller';
import { SIP_6_MAGIC_VALUE } from '@metamask/snaps-utils';
import { assertStruct } from '@metamask/utils';
import { ethErrors } from 'eth-rpc-errors';
import { literal, object, optional, string } from 'superstruct';
import { deriveEntropy } from '../utils';
const targetName = 'snap_getEntropy';
export const GetEntropyArgsStruct = object({
    version: literal(1),
    salt: optional(string())
});
const specificationBuilder = ({ allowedCaveats = null, methodHooks })=>{
    return {
        permissionType: PermissionType.RestrictedMethod,
        targetName,
        allowedCaveats,
        methodImplementation: getEntropyImplementation(methodHooks),
        subjectTypes: [
            SubjectType.Snap
        ]
    };
};
const methodHooks = {
    getMnemonic: true,
    getUnlockPromise: true
};
export const getEntropyBuilder = Object.freeze({
    targetName,
    specificationBuilder,
    methodHooks
});
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
 */ function getEntropyImplementation({ getMnemonic, getUnlockPromise }) {
    return async function getEntropy(options) {
        const { params, context: { origin } } = options;
        assertStruct(params, GetEntropyArgsStruct, 'Invalid "snap_getEntropy" parameters', ethErrors.rpc.invalidParams);
        await getUnlockPromise(true);
        const mnemonicPhrase = await getMnemonic();
        return deriveEntropy({
            input: origin,
            salt: params.salt,
            mnemonicPhrase,
            magic: SIP_6_MAGIC_VALUE
        });
    };
}

//# sourceMappingURL=getEntropy.js.map
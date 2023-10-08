"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    GetEntropyArgsStruct: function() {
        return GetEntropyArgsStruct;
    },
    getEntropyBuilder: function() {
        return getEntropyBuilder;
    }
});
const _permissioncontroller = require("@metamask/permission-controller");
const _snapsutils = require("@metamask/snaps-utils");
const _utils = require("@metamask/utils");
const _ethrpcerrors = require("eth-rpc-errors");
const _superstruct = require("superstruct");
const _utils1 = require("../utils");
const targetName = 'snap_getEntropy';
const GetEntropyArgsStruct = (0, _superstruct.object)({
    version: (0, _superstruct.literal)(1),
    salt: (0, _superstruct.optional)((0, _superstruct.string)())
});
const specificationBuilder = ({ allowedCaveats = null, methodHooks })=>{
    return {
        permissionType: _permissioncontroller.PermissionType.RestrictedMethod,
        targetName,
        allowedCaveats,
        methodImplementation: getEntropyImplementation(methodHooks),
        subjectTypes: [
            _permissioncontroller.SubjectType.Snap
        ]
    };
};
const methodHooks = {
    getMnemonic: true,
    getUnlockPromise: true
};
const getEntropyBuilder = Object.freeze({
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
        (0, _utils.assertStruct)(params, GetEntropyArgsStruct, 'Invalid "snap_getEntropy" parameters', _ethrpcerrors.ethErrors.rpc.invalidParams);
        await getUnlockPromise(true);
        const mnemonicPhrase = await getMnemonic();
        return (0, _utils1.deriveEntropy)({
            input: origin,
            salt: params.salt,
            mnemonicPhrase,
            magic: _snapsutils.SIP_6_MAGIC_VALUE
        });
    };
}

//# sourceMappingURL=getEntropy.js.map
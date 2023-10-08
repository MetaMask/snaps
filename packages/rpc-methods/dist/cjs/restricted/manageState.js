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
    ManageStateOperation: function() {
        return ManageStateOperation;
    },
    STATE_ENCRYPTION_SALT: function() {
        return STATE_ENCRYPTION_SALT;
    },
    specificationBuilder: function() {
        return specificationBuilder;
    },
    manageStateBuilder: function() {
        return manageStateBuilder;
    },
    STORAGE_SIZE_LIMIT: function() {
        return STORAGE_SIZE_LIMIT;
    },
    getManageStateImplementation: function() {
        return getManageStateImplementation;
    },
    getValidatedParams: function() {
        return getValidatedParams;
    }
});
const _permissioncontroller = require("@metamask/permission-controller");
const _snapsutils = require("@metamask/snaps-utils");
const _utils = require("@metamask/utils");
const _ethrpcerrors = require("eth-rpc-errors");
const _utils1 = require("../utils");
const STATE_ENCRYPTION_SALT = 'snap_manageState encryption';
const methodName = 'snap_manageState';
const specificationBuilder = ({ allowedCaveats = null, methodHooks })=>{
    return {
        permissionType: _permissioncontroller.PermissionType.RestrictedMethod,
        targetName: methodName,
        allowedCaveats,
        methodImplementation: getManageStateImplementation(methodHooks),
        subjectTypes: [
            _permissioncontroller.SubjectType.Snap
        ]
    };
};
const methodHooks = {
    getMnemonic: true,
    getUnlockPromise: true,
    clearSnapState: true,
    getSnapState: true,
    updateSnapState: true,
    encrypt: true,
    decrypt: true
};
const manageStateBuilder = Object.freeze({
    targetName: methodName,
    specificationBuilder,
    methodHooks
});
var ManageStateOperation;
(function(ManageStateOperation) {
    ManageStateOperation["ClearState"] = 'clear';
    ManageStateOperation["GetState"] = 'get';
    ManageStateOperation["UpdateState"] = 'update';
})(ManageStateOperation || (ManageStateOperation = {}));
const STORAGE_SIZE_LIMIT = 104857600; // In bytes (100MB)
/**
 * Get a deterministic encryption key to use for encrypting and decrypting the
 * state.
 *
 * This key should only be used for state encryption using `snap_manageState`.
 * To get other encryption keys, a different salt can be used.
 *
 * @param args - The encryption key args.
 * @param args.snapId - The ID of the snap to get the encryption key for.
 * @param args.mnemonicPhrase - The mnemonic phrase to derive the encryption key
 * from.
 * @returns The state encryption key.
 */ async function getEncryptionKey({ mnemonicPhrase, snapId }) {
    return await (0, _utils1.deriveEntropy)({
        mnemonicPhrase,
        input: snapId,
        salt: STATE_ENCRYPTION_SALT,
        magic: _snapsutils.STATE_ENCRYPTION_MAGIC_VALUE
    });
}
/**
 * Encrypt the state using a deterministic encryption algorithm, based on the
 * snap ID and mnemonic phrase.
 *
 * @param args - The encryption args.
 * @param args.state - The state to encrypt.
 * @param args.encryptFunction - The function to use for encrypting the state.
 * @param args.snapId - The ID of the snap to get the encryption key for.
 * @param args.mnemonicPhrase - The mnemonic phrase to derive the encryption key
 * from.
 * @returns The encrypted state.
 */ async function encryptState({ state, encryptFunction, ...keyArgs }) {
    const encryptionKey = await getEncryptionKey(keyArgs);
    return await encryptFunction(encryptionKey, state);
}
/**
 * Decrypt the state using a deterministic decryption algorithm, based on the
 * snap ID and mnemonic phrase.
 *
 * @param args - The encryption args.
 * @param args.state - The state to decrypt.
 * @param args.decryptFunction - The function to use for decrypting the state.
 * @param args.snapId - The ID of the snap to get the encryption key for.
 * @param args.mnemonicPhrase - The mnemonic phrase to derive the encryption key
 * from.
 * @returns The encrypted state.
 */ async function decryptState({ state, decryptFunction, ...keyArgs }) {
    try {
        const encryptionKey = await getEncryptionKey(keyArgs);
        const decryptedState = await decryptFunction(encryptionKey, state);
        (0, _utils.assert)((0, _utils.isValidJson)(decryptedState));
        return decryptedState;
    } catch  {
        throw _ethrpcerrors.ethErrors.rpc.internal({
            message: 'Failed to decrypt snap state, the state must be corrupted.'
        });
    }
}
function getManageStateImplementation({ getMnemonic, getUnlockPromise, clearSnapState, getSnapState, updateSnapState, encrypt, decrypt }) {
    return async function manageState(options) {
        const { params = {}, method, context: { origin } } = options;
        const { operation, newState } = getValidatedParams(params, method);
        await getUnlockPromise(true);
        const mnemonicPhrase = await getMnemonic();
        switch(operation){
            case ManageStateOperation.ClearState:
                await clearSnapState(origin);
                return null;
            case ManageStateOperation.GetState:
                {
                    const state = await getSnapState(origin);
                    if (state === null) {
                        return state;
                    }
                    return await decryptState({
                        state,
                        decryptFunction: decrypt,
                        mnemonicPhrase,
                        snapId: origin
                    });
                }
            case ManageStateOperation.UpdateState:
                {
                    (0, _utils.assert)(newState);
                    const encryptedState = await encryptState({
                        state: newState,
                        encryptFunction: encrypt,
                        mnemonicPhrase,
                        snapId: origin
                    });
                    await updateSnapState(origin, encryptedState);
                    return null;
                }
            default:
                throw _ethrpcerrors.ethErrors.rpc.invalidParams(`Invalid ${method} operation: "${operation}"`);
        }
    };
}
function getValidatedParams(params, method, storageSizeLimit = STORAGE_SIZE_LIMIT) {
    if (!(0, _utils.isObject)(params)) {
        throw _ethrpcerrors.ethErrors.rpc.invalidParams({
            message: 'Expected params to be a single object.'
        });
    }
    const { operation, newState } = params;
    if (!operation || typeof operation !== 'string' || !Object.values(ManageStateOperation).includes(operation)) {
        throw _ethrpcerrors.ethErrors.rpc.invalidParams({
            message: 'Must specify a valid manage state "operation".'
        });
    }
    if (operation === ManageStateOperation.UpdateState) {
        if (!(0, _utils.isObject)(newState)) {
            throw _ethrpcerrors.ethErrors.rpc.invalidParams({
                message: `Invalid ${method} "updateState" parameter: The new state must be a plain object.`,
                data: {
                    receivedNewState: typeof newState === 'undefined' ? 'undefined' : newState
                }
            });
        }
        let size;
        try {
            // `getJsonSize` will throw if the state is not JSON serializable.
            size = (0, _utils.getJsonSize)(newState);
        } catch  {
            throw _ethrpcerrors.ethErrors.rpc.invalidParams({
                message: `Invalid ${method} "updateState" parameter: The new state must be JSON serializable.`,
                data: {
                    receivedNewState: typeof newState === 'undefined' ? 'undefined' : newState
                }
            });
        }
        if (size > storageSizeLimit) {
            throw _ethrpcerrors.ethErrors.rpc.invalidParams({
                message: `Invalid ${method} "updateState" parameter: The new state must not exceed ${storageSizeLimit} bytes in size.`,
                data: {
                    receivedNewState: typeof newState === 'undefined' ? 'undefined' : newState
                }
            });
        }
    }
    return params;
}

//# sourceMappingURL=manageState.js.map
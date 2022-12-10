"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBip44EntropyImplementation = exports.getBip44EntropyCaveatSpecifications = exports.getBip44EntropyCaveatMapper = exports.getBip44EntropyBuilder = exports.validateCaveat = exports.validateParams = void 0;
const controllers_1 = require("@metamask/controllers");
const eth_rpc_errors_1 = require("eth-rpc-errors");
const key_tree_1 = require("@metamask/key-tree");
const utils_1 = require("@metamask/utils");
const snap_utils_1 = require("@metamask/snap-utils");
const targetKey = 'snap_getBip44Entropy';
/**
 * Validate the params for `snap_getBip44Entropy`.
 *
 * @param value - The params to validate.
 * @throws If the params are invalid.
 */
function validateParams(value) {
    if (!(0, utils_1.isPlainObject)(value) || !(0, utils_1.hasProperty)(value, 'coinType')) {
        throw eth_rpc_errors_1.ethErrors.rpc.invalidParams({
            message: 'Expected a plain object containing a coin type.',
        });
    }
    if (typeof value.coinType !== 'number' ||
        !Number.isInteger(value.coinType) ||
        value.coinType < 0 ||
        value.coinType > 0x7fffffff) {
        throw eth_rpc_errors_1.ethErrors.rpc.invalidParams({
            message: 'Invalid "coinType" parameter. Coin type must be a non-negative integer.',
        });
    }
}
exports.validateParams = validateParams;
/**
 * Validate the coin types values associated with a caveat. This checks if the
 * values are non-negative integers (>= 0).
 *
 * @param caveat - The caveat to validate.
 * @throws If the caveat is invalid.
 */
function validateCaveat(caveat) {
    if (!(0, utils_1.hasProperty)(caveat, 'value') ||
        !Array.isArray(caveat.value) ||
        caveat.value.length === 0) {
        throw eth_rpc_errors_1.ethErrors.rpc.invalidParams({
            message: 'Expected non-empty array of coin types.',
        });
    }
    caveat.value.forEach(validateParams);
}
exports.validateCaveat = validateCaveat;
/**
 * The specification builder for the `snap_getBip44Entropy` permission.
 * `snap_getBip44Entropy_*` lets the Snap control private keys for a particular
 * BIP-32 coin type.
 *
 * @param options - The specification builder options.
 * @param options.methodHooks - The RPC method hooks needed by the method
 * implementation.
 * @returns The specification for the `snap_getBip44Entropy` permission.
 */
const specificationBuilder = ({ methodHooks }) => {
    return {
        permissionType: controllers_1.PermissionType.RestrictedMethod,
        targetKey,
        allowedCaveats: [snap_utils_1.SnapCaveatType.PermittedCoinTypes],
        methodImplementation: getBip44EntropyImplementation(methodHooks),
        validator: ({ caveats }) => {
            if ((caveats === null || caveats === void 0 ? void 0 : caveats.length) !== 1 ||
                caveats[0].type !== snap_utils_1.SnapCaveatType.PermittedCoinTypes) {
                throw eth_rpc_errors_1.ethErrors.rpc.invalidParams({
                    message: `Expected a single "${snap_utils_1.SnapCaveatType.PermittedCoinTypes}" caveat.`,
                });
            }
        },
    };
};
exports.getBip44EntropyBuilder = Object.freeze({
    targetKey,
    specificationBuilder,
    methodHooks: {
        getMnemonic: true,
        getUnlockPromise: true,
    },
});
/**
 * Map a raw value from the `initialPermissions` to a caveat specification.
 * Note that this function does not do any validation, that's handled by the
 * PermissionsController when the permission is requested.
 *
 * @param value - The raw value from the `initialPermissions`.
 * @returns The caveat specification.
 */
function getBip44EntropyCaveatMapper(value) {
    return {
        caveats: [
            {
                type: snap_utils_1.SnapCaveatType.PermittedCoinTypes,
                value,
            },
        ],
    };
}
exports.getBip44EntropyCaveatMapper = getBip44EntropyCaveatMapper;
exports.getBip44EntropyCaveatSpecifications = {
    [snap_utils_1.SnapCaveatType.PermittedCoinTypes]: Object.freeze({
        type: snap_utils_1.SnapCaveatType.PermittedCoinTypes,
        decorator: (method, caveat) => {
            return async (args) => {
                const { params } = args;
                validateParams(params);
                const coinType = caveat.value.find((caveatValue) => caveatValue.coinType === params.coinType);
                if (!coinType) {
                    throw eth_rpc_errors_1.ethErrors.provider.unauthorized({
                        message: 'The requested coin type is not permitted. Allowed coin types must be specified in the snap manifest.',
                    });
                }
                return await method(args);
            };
        },
        validator: (caveat) => validateCaveat(caveat),
    }),
};
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
function getBip44EntropyImplementation({ getMnemonic, getUnlockPromise, }) {
    return async function getBip44Entropy(args) {
        await getUnlockPromise(true);
        // `args.params` is validated by the decorator, so it's safe to assert here.
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const params = args.params;
        const node = await key_tree_1.BIP44CoinTypeNode.fromDerivationPath([
            `bip39:${await getMnemonic()}`,
            `bip32:44'`,
            `bip32:${params.coinType}'`,
        ]);
        return node.toJSON();
    };
}
exports.getBip44EntropyImplementation = getBip44EntropyImplementation;
//# sourceMappingURL=getBip44Entropy.js.map
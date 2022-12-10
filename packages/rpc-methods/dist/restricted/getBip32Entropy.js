"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBip32EntropyImplementation = exports.getBip32EntropyCaveatSpecifications = exports.getBip32EntropyCaveatMapper = exports.getBip32EntropyBuilder = exports.validateCaveatPaths = exports.validatePath = void 0;
const controllers_1 = require("@metamask/controllers");
const eth_rpc_errors_1 = require("eth-rpc-errors");
const utils_1 = require("@metamask/utils");
const key_tree_1 = require("@metamask/key-tree");
const snap_utils_1 = require("@metamask/snap-utils");
const utils_2 = require("../utils");
const INDEX_REGEX = /^\d+'?$/u;
const targetKey = 'snap_getBip32Entropy';
/**
 * Validate a caveat path object. The object must consist of a `path` array and
 * optionally a `curve` string. Paths must start with `m`, and must contain at
 * least two indices. If `ed25519` is used, this checks if all the path indices
 * are hardened.
 *
 * @param value - The value to validate.
 * @throws If the value is invalid.
 */
function validatePath(value) {
    if (!(0, utils_1.isPlainObject)(value)) {
        throw eth_rpc_errors_1.ethErrors.rpc.invalidParams({
            message: 'Expected a plain object.',
        });
    }
    if (!(0, utils_1.hasProperty)(value, 'path') ||
        !Array.isArray(value.path) ||
        value.path.length === 0) {
        throw eth_rpc_errors_1.ethErrors.rpc.invalidParams({
            message: `Invalid "path" parameter. The path must be a non-empty BIP-32 derivation path array.`,
        });
    }
    if (value.path[0] !== 'm') {
        throw eth_rpc_errors_1.ethErrors.rpc.invalidParams({
            message: `Invalid "path" parameter. The path must start with "m".`,
        });
    }
    if (value.path
        .slice(1)
        .some((v) => typeof v !== 'string' || !INDEX_REGEX.test(v))) {
        throw eth_rpc_errors_1.ethErrors.rpc.invalidParams({
            message: `Invalid "path" parameter. The path must be a valid BIP-32 derivation path array.`,
        });
    }
    if (value.path.length < 3) {
        throw eth_rpc_errors_1.ethErrors.rpc.invalidParams({
            message: `Invalid "path" parameter. Paths must have a length of at least three.`,
        });
    }
    if (!(0, utils_1.hasProperty)(value, 'curve') ||
        (value.curve !== 'secp256k1' && value.curve !== 'ed25519')) {
        throw eth_rpc_errors_1.ethErrors.rpc.invalidParams({
            message: `Invalid "curve" parameter. The curve must be "secp256k1" or "ed25519".`,
        });
    }
    if (value.curve === 'ed25519' &&
        value.path.slice(1).some((v) => !v.endsWith("'"))) {
        throw eth_rpc_errors_1.ethErrors.rpc.invalidParams({
            message: `Invalid "path" parameter. Ed25519 does not support unhardened paths.`,
        });
    }
}
exports.validatePath = validatePath;
/**
 * Validate the path values associated with a caveat. This validates that the
 * value is a non-empty array with valid derivation paths and curves.
 *
 * @param caveat - The caveat to validate.
 * @throws If the value is invalid.
 */
function validateCaveatPaths(caveat) {
    if (!(0, utils_1.hasProperty)(caveat, 'value') ||
        !Array.isArray(caveat.value) ||
        caveat.value.length === 0) {
        throw eth_rpc_errors_1.ethErrors.rpc.invalidParams({
            message: 'Expected non-empty array of paths.',
        });
    }
    caveat.value.forEach((path) => validatePath(path));
}
exports.validateCaveatPaths = validateCaveatPaths;
/**
 * The specification builder for the `snap_getBip32Entropy` permission.
 * `snap_getBip32Entropy` lets the Snap control private keys for a particular
 * BIP-32 node.
 *
 * @param options - The specification builder options.
 * @param options.methodHooks - The RPC method hooks needed by the method implementation.
 * @returns The specification for the `snap_getBip32Entropy` permission.
 */
const specificationBuilder = ({ methodHooks }) => {
    return {
        permissionType: controllers_1.PermissionType.RestrictedMethod,
        targetKey,
        allowedCaveats: [snap_utils_1.SnapCaveatType.PermittedDerivationPaths],
        methodImplementation: getBip32EntropyImplementation(methodHooks),
        validator: ({ caveats }) => {
            if ((caveats === null || caveats === void 0 ? void 0 : caveats.length) !== 1 ||
                caveats[0].type !== snap_utils_1.SnapCaveatType.PermittedDerivationPaths) {
                throw eth_rpc_errors_1.ethErrors.rpc.invalidParams({
                    message: `Expected a single "${snap_utils_1.SnapCaveatType.PermittedDerivationPaths}" caveat.`,
                });
            }
        },
    };
};
exports.getBip32EntropyBuilder = Object.freeze({
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
function getBip32EntropyCaveatMapper(value) {
    return {
        caveats: [
            {
                type: snap_utils_1.SnapCaveatType.PermittedDerivationPaths,
                value,
            },
        ],
    };
}
exports.getBip32EntropyCaveatMapper = getBip32EntropyCaveatMapper;
exports.getBip32EntropyCaveatSpecifications = {
    [snap_utils_1.SnapCaveatType.PermittedDerivationPaths]: Object.freeze({
        type: snap_utils_1.SnapCaveatType.PermittedDerivationPaths,
        decorator: (method, caveat) => {
            return async (args) => {
                const { params } = args;
                validatePath(params);
                const path = caveat.value.find((caveatPath) => (0, utils_2.isEqual)(params.path.slice(0, caveatPath.path.length), caveatPath.path) && caveatPath.curve === params.curve);
                if (!path) {
                    throw eth_rpc_errors_1.ethErrors.provider.unauthorized({
                        message: 'The requested path is not permitted. Allowed paths must be specified in the snap manifest.',
                    });
                }
                return await method(args);
            };
        },
        validator: (caveat) => validateCaveatPaths(caveat),
    }),
};
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
function getBip32EntropyImplementation({ getMnemonic, getUnlockPromise, }) {
    return async function getBip32Entropy(args) {
        await getUnlockPromise(true);
        // `args.params` is validated by the decorator, so it's safe to assert here.
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const params = args.params;
        const node = await key_tree_1.SLIP10Node.fromDerivationPath({
            curve: params.curve,
            derivationPath: [
                `bip39:${await getMnemonic()}`,
                ...params.path
                    .slice(1)
                    .map((index) => `bip32:${index}`),
            ],
        });
        return node.toJSON();
    };
}
exports.getBip32EntropyImplementation = getBip32EntropyImplementation;
//# sourceMappingURL=getBip32Entropy.js.map
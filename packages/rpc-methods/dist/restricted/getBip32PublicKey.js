"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBip32PublicKeyImplementation = exports.getBip32PublicKeyCaveatSpecifications = exports.getBip32PublicKeyBuilder = void 0;
const controllers_1 = require("@metamask/controllers");
const eth_rpc_errors_1 = require("eth-rpc-errors");
const key_tree_1 = require("@metamask/key-tree");
const snap_utils_1 = require("@metamask/snap-utils");
const utils_1 = require("../utils");
const getBip32Entropy_1 = require("./getBip32Entropy");
const targetKey = 'snap_getBip32PublicKey';
/**
 * The specification builder for the `snap_getBip32PublicKey` permission.
 * `snap_getBip32PublicKey` lets the Snap retrieve public keys for a particular
 * BIP-32 node.
 *
 * @param options - The specification builder options.
 * @param options.methodHooks - The RPC method hooks needed by the method implementation.
 * @returns The specification for the `snap_getBip32PublicKey` permission.
 */
const specificationBuilder = ({ methodHooks }) => {
    return {
        permissionType: controllers_1.PermissionType.RestrictedMethod,
        targetKey,
        allowedCaveats: [snap_utils_1.SnapCaveatType.PermittedDerivationPaths],
        methodImplementation: getBip32PublicKeyImplementation(methodHooks),
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
exports.getBip32PublicKeyBuilder = Object.freeze({
    targetKey,
    specificationBuilder,
    methodHooks: {
        getMnemonic: true,
        getUnlockPromise: true,
    },
});
exports.getBip32PublicKeyCaveatSpecifications = {
    [snap_utils_1.SnapCaveatType.PermittedDerivationPaths]: Object.freeze({
        type: snap_utils_1.SnapCaveatType.PermittedDerivationPaths,
        decorator: (method, caveat) => {
            return async (args) => {
                const { params } = args;
                (0, getBip32Entropy_1.validatePath)(params);
                const path = caveat.value.find((caveatPath) => (0, utils_1.isEqual)(params.path, caveatPath.path) &&
                    caveatPath.curve === params.curve);
                if (!path) {
                    throw eth_rpc_errors_1.ethErrors.provider.unauthorized({
                        message: 'The requested path is not permitted. Allowed paths must be specified in the snap manifest.',
                    });
                }
                return await method(args);
            };
        },
        validator: (caveat) => (0, getBip32Entropy_1.validateCaveatPaths)(caveat),
    }),
};
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
function getBip32PublicKeyImplementation({ getMnemonic, getUnlockPromise, }) {
    return async function getBip32PublicKey(args) {
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
        if (params.compressed) {
            return node.compressedPublicKey;
        }
        return node.publicKey;
    };
}
exports.getBip32PublicKeyImplementation = getBip32PublicKeyImplementation;
//# sourceMappingURL=getBip32PublicKey.js.map
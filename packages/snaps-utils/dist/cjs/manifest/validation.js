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
    FORBIDDEN_COIN_TYPES: function() {
        return FORBIDDEN_COIN_TYPES;
    },
    Bip32PathStruct: function() {
        return Bip32PathStruct;
    },
    bip32entropy: function() {
        return bip32entropy;
    },
    Bip32EntropyStruct: function() {
        return Bip32EntropyStruct;
    },
    SnapGetBip32EntropyPermissionsStruct: function() {
        return SnapGetBip32EntropyPermissionsStruct;
    },
    SemVerRangeStruct: function() {
        return SemVerRangeStruct;
    },
    SnapIdsStruct: function() {
        return SnapIdsStruct;
    },
    ChainIdsStruct: function() {
        return ChainIdsStruct;
    },
    PermissionsStruct: function() {
        return PermissionsStruct;
    },
    SnapManifestStruct: function() {
        return SnapManifestStruct;
    },
    isSnapManifest: function() {
        return isSnapManifest;
    },
    assertIsSnapManifest: function() {
        return assertIsSnapManifest;
    },
    createSnapManifest: function() {
        return createSnapManifest;
    }
});
const _keytree = require("@metamask/key-tree");
const _utils = require("@metamask/utils");
const _superstruct = require("superstruct");
const _array = require("../array");
const _cronjob = require("../cronjob");
const _entropy = require("../entropy");
const _jsonrpc = require("../json-rpc");
const _namespace = require("../namespace");
const _snaps = require("../snaps");
const _types = require("../types");
// BIP-43 purposes that cannot be used for entropy derivation. These are in the
// string form, ending with `'`.
const FORBIDDEN_PURPOSES = [
    _entropy.SIP_6_MAGIC_VALUE,
    _entropy.STATE_ENCRYPTION_MAGIC_VALUE
];
const FORBIDDEN_COIN_TYPES = [
    60
];
const FORBIDDEN_PATHS = FORBIDDEN_COIN_TYPES.map((coinType)=>[
        'm',
        "44'",
        `${coinType}'`
    ]);
const Bip32PathStruct = (0, _superstruct.refine)((0, _superstruct.array)((0, _superstruct.string)()), 'BIP-32 path', (path)=>{
    if (path.length === 0) {
        return 'Path must be a non-empty BIP-32 derivation path array';
    }
    if (path[0] !== 'm') {
        return 'Path must start with "m".';
    }
    if (path.length < 3) {
        return 'Paths must have a length of at least three.';
    }
    if (path.slice(1).some((part)=>!(0, _keytree.isValidBIP32PathSegment)(part))) {
        return 'Path must be a valid BIP-32 derivation path array.';
    }
    if (FORBIDDEN_PURPOSES.includes(path[1])) {
        return `The purpose "${path[1]}" is not allowed for entropy derivation.`;
    }
    if (FORBIDDEN_PATHS.some((forbiddenPath)=>(0, _array.isEqual)(path.slice(0, forbiddenPath.length), forbiddenPath))) {
        return `The path "${path.join('/')}" is not allowed for entropy derivation.`;
    }
    return true;
});
const bip32entropy = (struct)=>(0, _superstruct.refine)(struct, 'BIP-32 entropy', (value)=>{
        if (value.curve === 'ed25519' && value.path.slice(1).some((part)=>!part.endsWith("'"))) {
            return 'Ed25519 does not support unhardened paths.';
        }
        return true;
    });
const Bip32EntropyStruct = bip32entropy((0, _superstruct.type)({
    path: Bip32PathStruct,
    curve: (0, _superstruct.enums)([
        'ed25519',
        'secp256k1'
    ])
}));
const SnapGetBip32EntropyPermissionsStruct = (0, _superstruct.size)((0, _superstruct.array)(Bip32EntropyStruct), 1, Infinity);
const SemVerRangeStruct = (0, _superstruct.refine)((0, _superstruct.string)(), 'SemVer range', (value)=>{
    if ((0, _utils.isValidSemVerRange)(value)) {
        return true;
    }
    return 'Expected a valid SemVer range.';
});
const SnapIdsStruct = (0, _superstruct.refine)((0, _superstruct.record)(_snaps.SnapIdStruct, (0, _superstruct.object)({
    version: (0, _superstruct.optional)(SemVerRangeStruct)
})), 'SnapIds', (value)=>{
    if (Object.keys(value).length === 0) {
        return false;
    }
    return true;
});
const ChainIdsStruct = (0, _superstruct.array)(_namespace.ChainIdStruct);
const PermissionsStruct = (0, _superstruct.type)({
    'endowment:network-access': (0, _superstruct.optional)((0, _superstruct.object)({})),
    'endowment:webassembly': (0, _superstruct.optional)((0, _superstruct.object)({})),
    'endowment:transaction-insight': (0, _superstruct.optional)((0, _superstruct.object)({
        allowTransactionOrigin: (0, _superstruct.optional)((0, _superstruct.boolean)())
    })),
    'endowment:cronjob': (0, _superstruct.optional)((0, _superstruct.object)({
        jobs: _cronjob.CronjobSpecificationArrayStruct
    })),
    'endowment:rpc': (0, _superstruct.optional)(_jsonrpc.RpcOriginsStruct),
    'endowment:name-lookup': (0, _superstruct.optional)(ChainIdsStruct),
    'endowment:keyring': (0, _superstruct.optional)(_jsonrpc.KeyringOriginsStruct),
    snap_dialog: (0, _superstruct.optional)((0, _superstruct.object)({})),
    // TODO: Remove
    snap_confirm: (0, _superstruct.optional)((0, _superstruct.object)({})),
    snap_manageState: (0, _superstruct.optional)((0, _superstruct.object)({})),
    snap_manageAccounts: (0, _superstruct.optional)((0, _superstruct.object)({})),
    snap_notify: (0, _superstruct.optional)((0, _superstruct.object)({})),
    snap_getBip32Entropy: (0, _superstruct.optional)(SnapGetBip32EntropyPermissionsStruct),
    snap_getBip32PublicKey: (0, _superstruct.optional)(SnapGetBip32EntropyPermissionsStruct),
    snap_getBip44Entropy: (0, _superstruct.optional)((0, _superstruct.size)((0, _superstruct.array)((0, _superstruct.object)({
        coinType: (0, _superstruct.size)((0, _superstruct.integer)(), 0, 2 ** 32 - 1)
    })), 1, Infinity)),
    snap_getEntropy: (0, _superstruct.optional)((0, _superstruct.object)({})),
    wallet_snap: (0, _superstruct.optional)(SnapIdsStruct)
});
const SnapManifestStruct = (0, _superstruct.object)({
    version: _utils.VersionStruct,
    description: (0, _superstruct.size)((0, _superstruct.string)(), 1, 280),
    proposedName: (0, _superstruct.size)((0, _superstruct.pattern)((0, _superstruct.string)(), /^(?:[A-Za-z0-9-_]+( [A-Za-z0-9-_]+)*)|(?:(?:@[A-Za-z0-9-*~][A-Za-z0-9-*._~]*\/)?[A-Za-z0-9-~][A-Za-z0-9-._~]*)$/u), 1, 214),
    repository: (0, _superstruct.optional)((0, _superstruct.object)({
        type: (0, _superstruct.size)((0, _superstruct.string)(), 1, Infinity),
        url: (0, _superstruct.size)((0, _superstruct.string)(), 1, Infinity)
    })),
    source: (0, _superstruct.object)({
        shasum: _utils.ChecksumStruct,
        location: (0, _superstruct.object)({
            npm: (0, _superstruct.object)({
                filePath: (0, _superstruct.size)((0, _superstruct.string)(), 1, Infinity),
                iconPath: (0, _superstruct.optional)((0, _superstruct.size)((0, _superstruct.string)(), 1, Infinity)),
                packageName: _types.NameStruct,
                registry: (0, _superstruct.union)([
                    (0, _superstruct.literal)('https://registry.npmjs.org'),
                    (0, _superstruct.literal)('https://registry.npmjs.org/')
                ])
            })
        })
    }),
    initialPermissions: PermissionsStruct,
    manifestVersion: (0, _superstruct.literal)('0.1'),
    $schema: (0, _superstruct.optional)((0, _superstruct.string)())
});
function isSnapManifest(value) {
    return (0, _superstruct.is)(value, SnapManifestStruct);
}
function assertIsSnapManifest(value) {
    (0, _utils.assertStruct)(value, SnapManifestStruct, `"${_types.NpmSnapFileNames.Manifest}" is invalid`);
}
function createSnapManifest(value) {
    // TODO: Add a utility to prefix these errors similar to assertStruct
    return (0, _superstruct.create)(value, SnapManifestStruct);
}

//# sourceMappingURL=validation.js.map
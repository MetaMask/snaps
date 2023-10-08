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
    SnapStatus: function() {
        return SnapStatus;
    },
    SnapStatusEvents: function() {
        return SnapStatusEvents;
    },
    PROPOSED_NAME_REGEX: function() {
        return PROPOSED_NAME_REGEX;
    },
    ProgrammaticallyFixableSnapError: function() {
        return ProgrammaticallyFixableSnapError;
    },
    getSnapChecksum: function() {
        return getSnapChecksum;
    },
    validateSnapShasum: function() {
        return validateSnapShasum;
    },
    LOCALHOST_HOSTNAMES: function() {
        return LOCALHOST_HOSTNAMES;
    },
    BaseSnapIdStruct: function() {
        return BaseSnapIdStruct;
    },
    LocalSnapIdStruct: function() {
        return LocalSnapIdStruct;
    },
    NpmSnapIdStruct: function() {
        return NpmSnapIdStruct;
    },
    HttpSnapIdStruct: function() {
        return HttpSnapIdStruct;
    },
    SnapIdStruct: function() {
        return SnapIdStruct;
    },
    getSnapPrefix: function() {
        return getSnapPrefix;
    },
    stripSnapPrefix: function() {
        return stripSnapPrefix;
    },
    assertIsValidSnapId: function() {
        return assertIsValidSnapId;
    },
    isCaipChainId: function() {
        return isCaipChainId;
    },
    isSnapPermitted: function() {
        return isSnapPermitted;
    },
    verifyRequestedSnapPermissions: function() {
        return verifyRequestedSnapPermissions;
    }
});
const _utils = require("@metamask/utils");
const _base = require("@scure/base");
const _fastjsonstablestringify = /*#__PURE__*/ _interop_require_default(require("fast-json-stable-stringify"));
const _superstruct = require("superstruct");
const _validatenpmpackagename = /*#__PURE__*/ _interop_require_default(require("validate-npm-package-name"));
const _caveats = require("./caveats");
const _checksum = require("./checksum");
const _types = require("./types");
function _define_property(obj, key, value) {
    if (key in obj) {
        Object.defineProperty(obj, key, {
            value: value,
            enumerable: true,
            configurable: true,
            writable: true
        });
    } else {
        obj[key] = value;
    }
    return obj;
}
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
const PROPOSED_NAME_REGEX = /^(?:[A-Za-z0-9-_]+( [A-Za-z0-9-_]+)*)|(?:(?:@[A-Za-z0-9-*~][A-Za-z0-9-*._~]*\/)?[A-Za-z0-9-~][A-Za-z0-9-._~]*)$/u;
var SnapStatus;
(function(SnapStatus) {
    SnapStatus["Installing"] = 'installing';
    SnapStatus["Updating"] = 'updating';
    SnapStatus["Running"] = 'running';
    SnapStatus["Stopped"] = 'stopped';
    SnapStatus["Crashed"] = 'crashed';
})(SnapStatus || (SnapStatus = {}));
var SnapStatusEvents;
(function(SnapStatusEvents) {
    SnapStatusEvents["Start"] = 'START';
    SnapStatusEvents["Stop"] = 'STOP';
    SnapStatusEvents["Crash"] = 'CRASH';
    SnapStatusEvents["Update"] = 'UPDATE';
})(SnapStatusEvents || (SnapStatusEvents = {}));
class ProgrammaticallyFixableSnapError extends Error {
    constructor(message, reason){
        super(message);
        _define_property(this, "reason", void 0);
        this.reason = reason;
    }
}
/**
 * Gets a checksummable manifest by removing the shasum property and reserializing the JSON using a deterministic algorithm.
 *
 * @param manifest - The manifest itself.
 * @returns A virtual file containing the checksummable manifest.
 */ function getChecksummableManifest(manifest) {
    const manifestCopy = manifest.clone();
    delete manifestCopy.result.source.shasum;
    // We use fast-json-stable-stringify to deterministically serialize the JSON
    // This is required before checksumming so we get reproducible checksums across platforms etc
    manifestCopy.value = (0, _fastjsonstablestringify.default)(manifestCopy.result);
    return manifestCopy;
}
function getSnapChecksum(files) {
    const { manifest, sourceCode, svgIcon } = files;
    const all = [
        getChecksummableManifest(manifest),
        sourceCode,
        svgIcon
    ].filter((file)=>file !== undefined);
    return _base.base64.encode((0, _checksum.checksumFiles)(all));
}
function validateSnapShasum(files, errorMessage = 'Invalid Snap manifest: manifest shasum does not match computed shasum.') {
    if (files.manifest.result.source.shasum !== getSnapChecksum(files)) {
        throw new ProgrammaticallyFixableSnapError(errorMessage, _types.SnapValidationFailureReason.ShasumMismatch);
    }
}
const LOCALHOST_HOSTNAMES = [
    'localhost',
    '127.0.0.1',
    '[::1]'
];
const BaseSnapIdStruct = (0, _superstruct.pattern)((0, _superstruct.string)(), /^[\x21-\x7E]*$/u);
const LocalSnapIdSubUrlStruct = (0, _types.uri)({
    protocol: (0, _superstruct.enums)([
        'http:',
        'https:'
    ]),
    hostname: (0, _superstruct.enums)(LOCALHOST_HOSTNAMES),
    hash: (0, _superstruct.empty)((0, _superstruct.string)()),
    search: (0, _superstruct.empty)((0, _superstruct.string)())
});
const LocalSnapIdStruct = (0, _superstruct.refine)(BaseSnapIdStruct, 'local Snap Id', (value)=>{
    if (!value.startsWith(_types.SnapIdPrefixes.local)) {
        return `Expected local snap ID, got "${value}".`;
    }
    const [error] = (0, _superstruct.validate)(value.slice(_types.SnapIdPrefixes.local.length), LocalSnapIdSubUrlStruct);
    return error ?? true;
});
const NpmSnapIdStruct = (0, _superstruct.intersection)([
    BaseSnapIdStruct,
    (0, _types.uri)({
        protocol: (0, _superstruct.literal)(_types.SnapIdPrefixes.npm),
        pathname: (0, _superstruct.refine)((0, _superstruct.string)(), 'package name', function*(value) {
            const normalized = value.startsWith('/') ? value.slice(1) : value;
            const { errors, validForNewPackages, warnings } = (0, _validatenpmpackagename.default)(normalized);
            if (!validForNewPackages) {
                if (errors === undefined) {
                    (0, _utils.assert)(warnings !== undefined);
                    yield* warnings;
                } else {
                    yield* errors;
                }
            }
            return true;
        }),
        search: (0, _superstruct.empty)((0, _superstruct.string)()),
        hash: (0, _superstruct.empty)((0, _superstruct.string)())
    })
]);
const HttpSnapIdStruct = (0, _superstruct.intersection)([
    BaseSnapIdStruct,
    (0, _types.uri)({
        protocol: (0, _superstruct.enums)([
            'http:',
            'https:'
        ]),
        search: (0, _superstruct.empty)((0, _superstruct.string)()),
        hash: (0, _superstruct.empty)((0, _superstruct.string)())
    })
]);
const SnapIdStruct = (0, _superstruct.union)([
    NpmSnapIdStruct,
    LocalSnapIdStruct
]);
function getSnapPrefix(snapId) {
    const prefix = Object.values(_types.SnapIdPrefixes).find((possiblePrefix)=>snapId.startsWith(possiblePrefix));
    if (prefix !== undefined) {
        return prefix;
    }
    throw new Error(`Invalid or no prefix found for "${snapId}"`);
}
function stripSnapPrefix(snapId) {
    return snapId.replace(getSnapPrefix(snapId), '');
}
function assertIsValidSnapId(value) {
    (0, _utils.assertStruct)(value, SnapIdStruct, 'Invalid snap ID');
}
function isCaipChainId(chainId) {
    return typeof chainId === 'string' && RegExp("^(?<namespace>[-a-z0-9]{3,8}):(?<reference>[-a-zA-Z0-9]{1,32})$", "u").test(chainId);
}
function isSnapPermitted(permissions, snapId) {
    return Boolean((permissions?.wallet_snap?.caveats?.find((caveat)=>caveat.type === _caveats.SnapCaveatType.SnapIds) ?? {}).value?.[snapId]);
}
function verifyRequestedSnapPermissions(requestedPermissions) {
    (0, _utils.assert)((0, _utils.isObject)(requestedPermissions), 'Requested permissions must be an object.');
    const { wallet_snap: walletSnapPermission } = requestedPermissions;
    (0, _utils.assert)((0, _utils.isObject)(walletSnapPermission), 'wallet_snap is missing from the requested permissions.');
    const { caveats } = walletSnapPermission;
    (0, _utils.assert)(Array.isArray(caveats) && caveats.length === 1, 'wallet_snap must have a caveat property with a single-item array value.');
    const [caveat] = caveats;
    (0, _utils.assert)((0, _utils.isObject)(caveat) && caveat.type === _caveats.SnapCaveatType.SnapIds && (0, _utils.isObject)(caveat.value), `The requested permissions do not have a valid ${_caveats.SnapCaveatType.SnapIds} caveat.`);
}

//# sourceMappingURL=snaps.js.map
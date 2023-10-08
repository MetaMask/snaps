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
    NpmSnapFileNames: function() {
        return NpmSnapFileNames;
    },
    SnapIdPrefixes: function() {
        return SnapIdPrefixes;
    },
    SnapValidationFailureReason: function() {
        return SnapValidationFailureReason;
    },
    SNAP_STREAM_NAMES: function() {
        return SNAP_STREAM_NAMES;
    },
    NameStruct: function() {
        return NameStruct;
    },
    NpmSnapPackageJsonStruct: function() {
        return NpmSnapPackageJsonStruct;
    },
    isNpmSnapPackageJson: function() {
        return isNpmSnapPackageJson;
    },
    assertIsNpmSnapPackageJson: function() {
        return assertIsNpmSnapPackageJson;
    },
    SNAP_EXPORT_NAMES: function() {
        return SNAP_EXPORT_NAMES;
    },
    uri: function() {
        return uri;
    },
    isValidUrl: function() {
        return isValidUrl;
    },
    WALLET_SNAP_PERMISSION_KEY: function() {
        return WALLET_SNAP_PERMISSION_KEY;
    }
});
const _utils = require("@metamask/utils");
const _superstruct = require("superstruct");
const _handlers = require("./handlers");
var NpmSnapFileNames;
(function(NpmSnapFileNames) {
    NpmSnapFileNames["PackageJson"] = 'package.json';
    NpmSnapFileNames["Manifest"] = 'snap.manifest.json';
})(NpmSnapFileNames || (NpmSnapFileNames = {}));
const NameStruct = (0, _superstruct.size)((0, _superstruct.pattern)((0, _superstruct.string)(), /^(?:@[a-z0-9-*~][a-z0-9-*._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/u), 1, 214);
const NpmSnapPackageJsonStruct = (0, _superstruct.type)({
    version: _utils.VersionStruct,
    name: NameStruct,
    main: (0, _superstruct.optional)((0, _superstruct.size)((0, _superstruct.string)(), 1, Infinity)),
    repository: (0, _superstruct.optional)((0, _superstruct.object)({
        type: (0, _superstruct.size)((0, _superstruct.string)(), 1, Infinity),
        url: (0, _superstruct.size)((0, _superstruct.string)(), 1, Infinity)
    }))
});
function isNpmSnapPackageJson(value) {
    return (0, _superstruct.is)(value, NpmSnapPackageJsonStruct);
}
function assertIsNpmSnapPackageJson(value) {
    (0, _utils.assertStruct)(value, NpmSnapPackageJsonStruct, `"${NpmSnapFileNames.PackageJson}" is invalid`);
}
var SnapIdPrefixes;
(function(SnapIdPrefixes) {
    SnapIdPrefixes["npm"] = 'npm:';
    SnapIdPrefixes["local"] = 'local:';
})(SnapIdPrefixes || (SnapIdPrefixes = {}));
var SnapValidationFailureReason;
(function(SnapValidationFailureReason) {
    SnapValidationFailureReason["NameMismatch"] = '"name" field mismatch';
    SnapValidationFailureReason["VersionMismatch"] = '"version" field mismatch';
    SnapValidationFailureReason["RepositoryMismatch"] = '"repository" field mismatch';
    SnapValidationFailureReason["ShasumMismatch"] = '"shasum" field mismatch';
})(SnapValidationFailureReason || (SnapValidationFailureReason = {}));
var SNAP_STREAM_NAMES;
(function(SNAP_STREAM_NAMES) {
    SNAP_STREAM_NAMES["JSON_RPC"] = 'jsonRpc';
    SNAP_STREAM_NAMES["COMMAND"] = 'command';
})(SNAP_STREAM_NAMES || (SNAP_STREAM_NAMES = {}));
const SNAP_EXPORT_NAMES = Object.values(_handlers.HandlerType);
const uri = (opts = {})=>(0, _superstruct.refine)((0, _superstruct.union)([
        (0, _superstruct.string)(),
        (0, _superstruct.instance)(URL)
    ]), 'uri', (value)=>{
        try {
            const url = new URL(value);
            const UrlStruct = (0, _superstruct.type)(opts);
            (0, _superstruct.assert)(url, UrlStruct);
            return true;
        } catch  {
            return `Expected URL, got "${value.toString()}".`;
        }
    });
function isValidUrl(url, opts = {}) {
    return (0, _superstruct.is)(url, uri(opts));
}
const WALLET_SNAP_PERMISSION_KEY = 'wallet_snap';

//# sourceMappingURL=types.js.map
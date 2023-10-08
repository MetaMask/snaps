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
    DEFAULT_REQUESTED_SNAP_VERSION: function() {
        return DEFAULT_REQUESTED_SNAP_VERSION;
    },
    getTargetVersion: function() {
        return getTargetVersion;
    },
    resolveVersionRange: function() {
        return resolveVersionRange;
    }
});
const _utils = require("@metamask/utils");
const _semver = require("semver");
const _superstruct = require("superstruct");
const DEFAULT_REQUESTED_SNAP_VERSION = '*';
function getTargetVersion(versions, versionRange) {
    const maxSatisfyingNonPreRelease = (0, _semver.maxSatisfying)(versions, versionRange);
    // By default don't use pre-release versions
    if (maxSatisfyingNonPreRelease) {
        return maxSatisfyingNonPreRelease;
    }
    // If no satisfying release version is found by default, try pre-release versions
    return (0, _semver.maxSatisfying)(versions, versionRange, {
        includePrerelease: true
    });
}
function resolveVersionRange(version) {
    if (version === undefined || version === 'latest') {
        return [
            undefined,
            DEFAULT_REQUESTED_SNAP_VERSION
        ];
    }
    return (0, _superstruct.validate)(version, _utils.VersionRangeStruct);
}

//# sourceMappingURL=versions.js.map
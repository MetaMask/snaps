"use strict";Object.defineProperty(exports, "__esModule", {value: true});// src/versions.ts
var _utils = require('@metamask/utils');
var _semver = require('semver');
var _superstruct = require('superstruct');
var DEFAULT_REQUESTED_SNAP_VERSION = "*";
function getTargetVersion(versions, versionRange) {
  const maxSatisfyingNonPreRelease = _semver.maxSatisfying.call(void 0, 
    versions,
    versionRange
  );
  if (maxSatisfyingNonPreRelease) {
    return maxSatisfyingNonPreRelease;
  }
  return _semver.maxSatisfying.call(void 0, versions, versionRange, {
    includePrerelease: true
  });
}
function resolveVersionRange(version) {
  if (version === void 0 || version === "latest") {
    return [void 0, DEFAULT_REQUESTED_SNAP_VERSION];
  }
  return _superstruct.validate.call(void 0, version, _utils.VersionRangeStruct);
}





exports.DEFAULT_REQUESTED_SNAP_VERSION = DEFAULT_REQUESTED_SNAP_VERSION; exports.getTargetVersion = getTargetVersion; exports.resolveVersionRange = resolveVersionRange;
//# sourceMappingURL=chunk-IPOE62V4.js.map
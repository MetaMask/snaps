// src/versions.ts
import { validate } from "@metamask/superstruct";
import { VersionRangeStruct } from "@metamask/utils";
import { maxSatisfying as maxSatisfyingSemver } from "semver";
var DEFAULT_REQUESTED_SNAP_VERSION = "*";
function getTargetVersion(versions, versionRange) {
  const maxSatisfyingNonPreRelease = maxSatisfyingSemver(
    versions,
    versionRange
  );
  if (maxSatisfyingNonPreRelease) {
    return maxSatisfyingNonPreRelease;
  }
  return maxSatisfyingSemver(versions, versionRange, {
    includePrerelease: true
  });
}
function resolveVersionRange(version) {
  if (version === void 0 || version === "latest") {
    return [void 0, DEFAULT_REQUESTED_SNAP_VERSION];
  }
  return validate(version, VersionRangeStruct);
}

export {
  DEFAULT_REQUESTED_SNAP_VERSION,
  getTargetVersion,
  resolveVersionRange
};
//# sourceMappingURL=chunk-N5HVDE3P.mjs.map
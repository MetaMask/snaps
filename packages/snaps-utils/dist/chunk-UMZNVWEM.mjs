// src/versions.ts
import { VersionRangeStruct } from "@metamask/utils";
import { maxSatisfying as maxSatisfyingSemver } from "semver";
import { validate } from "superstruct";
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
//# sourceMappingURL=chunk-UMZNVWEM.mjs.map
// src/types.ts
import { assertStruct, VersionStruct } from "@metamask/utils";
import {
  instance,
  is,
  object,
  optional,
  pattern,
  refine,
  size,
  string,
  type,
  union,
  assert as assertSuperstruct
} from "superstruct";
var NpmSnapFileNames = /* @__PURE__ */ ((NpmSnapFileNames2) => {
  NpmSnapFileNames2["PackageJson"] = "package.json";
  NpmSnapFileNames2["Manifest"] = "snap.manifest.json";
  return NpmSnapFileNames2;
})(NpmSnapFileNames || {});
var NameStruct = size(
  pattern(
    string(),
    /^(?:@[a-z0-9-*~][a-z0-9-*._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/u
  ),
  1,
  214
);
var NpmSnapPackageJsonStruct = type({
  version: VersionStruct,
  name: NameStruct,
  main: optional(size(string(), 1, Infinity)),
  repository: optional(
    object({
      type: size(string(), 1, Infinity),
      url: size(string(), 1, Infinity)
    })
  )
});
function isNpmSnapPackageJson(value) {
  return is(value, NpmSnapPackageJsonStruct);
}
function assertIsNpmSnapPackageJson(value) {
  assertStruct(
    value,
    NpmSnapPackageJsonStruct,
    `"${"package.json" /* PackageJson */}" is invalid`
  );
}
var SnapIdPrefixes = /* @__PURE__ */ ((SnapIdPrefixes2) => {
  SnapIdPrefixes2["npm"] = "npm:";
  SnapIdPrefixes2["local"] = "local:";
  return SnapIdPrefixes2;
})(SnapIdPrefixes || {});
var SnapValidationFailureReason = /* @__PURE__ */ ((SnapValidationFailureReason2) => {
  SnapValidationFailureReason2["NameMismatch"] = '"name" field mismatch';
  SnapValidationFailureReason2["VersionMismatch"] = '"version" field mismatch';
  SnapValidationFailureReason2["RepositoryMismatch"] = '"repository" field mismatch';
  SnapValidationFailureReason2["ShasumMismatch"] = '"shasum" field mismatch';
  return SnapValidationFailureReason2;
})(SnapValidationFailureReason || {});
var SNAP_STREAM_NAMES = /* @__PURE__ */ ((SNAP_STREAM_NAMES2) => {
  SNAP_STREAM_NAMES2["JSON_RPC"] = "jsonRpc";
  SNAP_STREAM_NAMES2["COMMAND"] = "command";
  return SNAP_STREAM_NAMES2;
})(SNAP_STREAM_NAMES || {});
var uri = (opts = {}) => refine(union([string(), instance(URL)]), "uri", (value) => {
  try {
    const url = new URL(value);
    const UrlStruct = type(opts);
    assertSuperstruct(url, UrlStruct);
    return true;
  } catch {
    return `Expected URL, got "${value.toString()}".`;
  }
});
function isValidUrl(url, opts = {}) {
  return is(url, uri(opts));
}
var WALLET_SNAP_PERMISSION_KEY = "wallet_snap";

export {
  NpmSnapFileNames,
  NameStruct,
  NpmSnapPackageJsonStruct,
  isNpmSnapPackageJson,
  assertIsNpmSnapPackageJson,
  SnapIdPrefixes,
  SnapValidationFailureReason,
  SNAP_STREAM_NAMES,
  uri,
  isValidUrl,
  WALLET_SNAP_PERMISSION_KEY
};
//# sourceMappingURL=chunk-T6FWIDA6.mjs.map
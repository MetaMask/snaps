"use strict";Object.defineProperty(exports, "__esModule", {value: true});// src/types.ts
var _utils = require('@metamask/utils');












var _superstruct = require('superstruct');
var NpmSnapFileNames = /* @__PURE__ */ ((NpmSnapFileNames2) => {
  NpmSnapFileNames2["PackageJson"] = "package.json";
  NpmSnapFileNames2["Manifest"] = "snap.manifest.json";
  return NpmSnapFileNames2;
})(NpmSnapFileNames || {});
var NameStruct = _superstruct.size.call(void 0, 
  _superstruct.pattern.call(void 0, 
    _superstruct.string.call(void 0, ),
    /^(?:@[a-z0-9-*~][a-z0-9-*._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/u
  ),
  1,
  214
);
var NpmSnapPackageJsonStruct = _superstruct.type.call(void 0, {
  version: _utils.VersionStruct,
  name: NameStruct,
  main: _superstruct.optional.call(void 0, _superstruct.size.call(void 0, _superstruct.string.call(void 0, ), 1, Infinity)),
  repository: _superstruct.optional.call(void 0, 
    _superstruct.object.call(void 0, {
      type: _superstruct.size.call(void 0, _superstruct.string.call(void 0, ), 1, Infinity),
      url: _superstruct.size.call(void 0, _superstruct.string.call(void 0, ), 1, Infinity)
    })
  )
});
function isNpmSnapPackageJson(value) {
  return _superstruct.is.call(void 0, value, NpmSnapPackageJsonStruct);
}
function assertIsNpmSnapPackageJson(value) {
  _utils.assertStruct.call(void 0, 
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
var uri = (opts = {}) => _superstruct.refine.call(void 0, _superstruct.union.call(void 0, [_superstruct.string.call(void 0, ), _superstruct.instance.call(void 0, URL)]), "uri", (value) => {
  try {
    const url = new URL(value);
    const UrlStruct = _superstruct.type.call(void 0, opts);
    _superstruct.assert.call(void 0, url, UrlStruct);
    return true;
  } catch {
    return `Expected URL, got "${value.toString()}".`;
  }
});
function isValidUrl(url, opts = {}) {
  return _superstruct.is.call(void 0, url, uri(opts));
}
var WALLET_SNAP_PERMISSION_KEY = "wallet_snap";













exports.NpmSnapFileNames = NpmSnapFileNames; exports.NameStruct = NameStruct; exports.NpmSnapPackageJsonStruct = NpmSnapPackageJsonStruct; exports.isNpmSnapPackageJson = isNpmSnapPackageJson; exports.assertIsNpmSnapPackageJson = assertIsNpmSnapPackageJson; exports.SnapIdPrefixes = SnapIdPrefixes; exports.SnapValidationFailureReason = SnapValidationFailureReason; exports.SNAP_STREAM_NAMES = SNAP_STREAM_NAMES; exports.uri = uri; exports.isValidUrl = isValidUrl; exports.WALLET_SNAP_PERMISSION_KEY = WALLET_SNAP_PERMISSION_KEY;
//# sourceMappingURL=chunk-CMOSYNZR.js.map
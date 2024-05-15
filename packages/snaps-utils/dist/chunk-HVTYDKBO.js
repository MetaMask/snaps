"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }


var _chunkCMOSYNZRjs = require('./chunk-CMOSYNZR.js');


var _chunkMLOQHUOYjs = require('./chunk-MLOQHUOY.js');

// src/snaps.ts
var _utils = require('@metamask/utils');
var _base = require('@scure/base');
var _fastjsonstablestringify = require('fast-json-stable-stringify'); var _fastjsonstablestringify2 = _interopRequireDefault(_fastjsonstablestringify);










var _superstruct = require('superstruct');
var _validatenpmpackagename = require('validate-npm-package-name'); var _validatenpmpackagename2 = _interopRequireDefault(_validatenpmpackagename);
var PROPOSED_NAME_REGEX = /^(?:[A-Za-z0-9-_]+( [A-Za-z0-9-_]+)*)|(?:(?:@[A-Za-z0-9-*~][A-Za-z0-9-*._~]*\/)?[A-Za-z0-9-~][A-Za-z0-9-._~]*)$/u;
var SnapStatus = /* @__PURE__ */ ((SnapStatus2) => {
  SnapStatus2["Installing"] = "installing";
  SnapStatus2["Updating"] = "updating";
  SnapStatus2["Running"] = "running";
  SnapStatus2["Stopped"] = "stopped";
  SnapStatus2["Crashed"] = "crashed";
  return SnapStatus2;
})(SnapStatus || {});
var SnapStatusEvents = /* @__PURE__ */ ((SnapStatusEvents2) => {
  SnapStatusEvents2["Start"] = "START";
  SnapStatusEvents2["Stop"] = "STOP";
  SnapStatusEvents2["Crash"] = "CRASH";
  SnapStatusEvents2["Update"] = "UPDATE";
  return SnapStatusEvents2;
})(SnapStatusEvents || {});
var ProgrammaticallyFixableSnapError = class extends Error {
  constructor(message, reason) {
    super(message);
    this.reason = reason;
  }
};
function getChecksummableManifest(manifest) {
  const manifestCopy = manifest.clone();
  delete manifestCopy.result.source.shasum;
  manifestCopy.value = _fastjsonstablestringify2.default.call(void 0, manifestCopy.result);
  return manifestCopy;
}
async function getSnapChecksum(files) {
  const { manifest, sourceCode, svgIcon, auxiliaryFiles, localizationFiles } = files;
  const all = [
    getChecksummableManifest(manifest),
    sourceCode,
    svgIcon,
    ...auxiliaryFiles,
    ...localizationFiles
  ].filter((file) => file !== void 0);
  return _base.base64.encode(await _chunkMLOQHUOYjs.checksumFiles.call(void 0, all));
}
async function validateSnapShasum(files, errorMessage = "Invalid Snap manifest: manifest shasum does not match computed shasum.") {
  if (files.manifest.result.source.shasum !== await getSnapChecksum(files)) {
    throw new ProgrammaticallyFixableSnapError(
      errorMessage,
      '"shasum" field mismatch' /* ShasumMismatch */
    );
  }
}
var LOCALHOST_HOSTNAMES = ["localhost", "127.0.0.1", "[::1]"];
var BaseSnapIdStruct = _superstruct.pattern.call(void 0, _superstruct.string.call(void 0, ), /^[\x21-\x7E]*$/u);
var LocalSnapIdSubUrlStruct = _chunkCMOSYNZRjs.uri.call(void 0, {
  protocol: _superstruct.enums.call(void 0, ["http:", "https:"]),
  hostname: _superstruct.enums.call(void 0, LOCALHOST_HOSTNAMES),
  hash: _superstruct.empty.call(void 0, _superstruct.string.call(void 0, )),
  search: _superstruct.empty.call(void 0, _superstruct.string.call(void 0, ))
});
var LocalSnapIdStruct = _superstruct.refine.call(void 0, 
  BaseSnapIdStruct,
  "local Snap Id",
  (value) => {
    if (!value.startsWith("local:" /* local */)) {
      return `Expected local snap ID, got "${value}".`;
    }
    const [error] = _superstruct.validate.call(void 0, 
      value.slice("local:" /* local */.length),
      LocalSnapIdSubUrlStruct
    );
    return error ?? true;
  }
);
var NpmSnapIdStruct = _superstruct.intersection.call(void 0, [
  BaseSnapIdStruct,
  _chunkCMOSYNZRjs.uri.call(void 0, {
    protocol: _superstruct.literal.call(void 0, "npm:" /* npm */),
    pathname: _superstruct.refine.call(void 0, _superstruct.string.call(void 0, ), "package name", function* (value) {
      const normalized = value.startsWith("/") ? value.slice(1) : value;
      const { errors, validForNewPackages, warnings } = _validatenpmpackagename2.default.call(void 0, normalized);
      if (!validForNewPackages) {
        if (errors === void 0) {
          _utils.assert.call(void 0, warnings !== void 0);
          yield* warnings;
        } else {
          yield* errors;
        }
      }
      return true;
    }),
    search: _superstruct.empty.call(void 0, _superstruct.string.call(void 0, )),
    hash: _superstruct.empty.call(void 0, _superstruct.string.call(void 0, ))
  })
]);
var HttpSnapIdStruct = _superstruct.intersection.call(void 0, [
  BaseSnapIdStruct,
  _chunkCMOSYNZRjs.uri.call(void 0, {
    protocol: _superstruct.enums.call(void 0, ["http:", "https:"]),
    search: _superstruct.empty.call(void 0, _superstruct.string.call(void 0, )),
    hash: _superstruct.empty.call(void 0, _superstruct.string.call(void 0, ))
  })
]);
var SnapIdStruct = _superstruct.union.call(void 0, [NpmSnapIdStruct, LocalSnapIdStruct]);
function getSnapPrefix(snapId) {
  const prefix = Object.values(_chunkCMOSYNZRjs.SnapIdPrefixes).find(
    (possiblePrefix) => snapId.startsWith(possiblePrefix)
  );
  if (prefix !== void 0) {
    return prefix;
  }
  throw new Error(`Invalid or no prefix found for "${snapId}"`);
}
function stripSnapPrefix(snapId) {
  return snapId.replace(getSnapPrefix(snapId), "");
}
function assertIsValidSnapId(value) {
  _utils.assertStruct.call(void 0, value, SnapIdStruct, "Invalid snap ID");
}
function isCaipChainId(chainId) {
  return typeof chainId === "string" && /^(?<namespace>[-a-z0-9]{3,8}):(?<reference>[-a-zA-Z0-9]{1,32})$/u.test(
    chainId
  );
}
function isSnapPermitted(permissions, snapId) {
  return Boolean(
    (permissions?.wallet_snap?.caveats?.find(
      (caveat) => caveat.type === "snapIds" /* SnapIds */
    ) ?? {}).value?.[snapId]
  );
}
function verifyRequestedSnapPermissions(requestedPermissions) {
  _utils.assert.call(void 0, 
    _utils.isObject.call(void 0, requestedPermissions),
    "Requested permissions must be an object."
  );
  const { wallet_snap: walletSnapPermission } = requestedPermissions;
  _utils.assert.call(void 0, 
    _utils.isObject.call(void 0, walletSnapPermission),
    "wallet_snap is missing from the requested permissions."
  );
  const { caveats } = walletSnapPermission;
  _utils.assert.call(void 0, 
    Array.isArray(caveats) && caveats.length === 1,
    "wallet_snap must have a caveat property with a single-item array value."
  );
  const [caveat] = caveats;
  _utils.assert.call(void 0, 
    _utils.isObject.call(void 0, caveat) && caveat.type === "snapIds" /* SnapIds */ && _utils.isObject.call(void 0, caveat.value),
    `The requested permissions do not have a valid ${"snapIds" /* SnapIds */} caveat.`
  );
}




















exports.PROPOSED_NAME_REGEX = PROPOSED_NAME_REGEX; exports.SnapStatus = SnapStatus; exports.SnapStatusEvents = SnapStatusEvents; exports.ProgrammaticallyFixableSnapError = ProgrammaticallyFixableSnapError; exports.getSnapChecksum = getSnapChecksum; exports.validateSnapShasum = validateSnapShasum; exports.LOCALHOST_HOSTNAMES = LOCALHOST_HOSTNAMES; exports.BaseSnapIdStruct = BaseSnapIdStruct; exports.LocalSnapIdStruct = LocalSnapIdStruct; exports.NpmSnapIdStruct = NpmSnapIdStruct; exports.HttpSnapIdStruct = HttpSnapIdStruct; exports.SnapIdStruct = SnapIdStruct; exports.getSnapPrefix = getSnapPrefix; exports.stripSnapPrefix = stripSnapPrefix; exports.assertIsValidSnapId = assertIsValidSnapId; exports.isCaipChainId = isCaipChainId; exports.isSnapPermitted = isSnapPermitted; exports.verifyRequestedSnapPermissions = verifyRequestedSnapPermissions;
//# sourceMappingURL=chunk-HVTYDKBO.js.map
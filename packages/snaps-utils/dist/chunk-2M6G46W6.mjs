import {
  SnapIdPrefixes,
  uri
} from "./chunk-T6FWIDA6.mjs";
import {
  checksumFiles
} from "./chunk-HJRCBSNA.mjs";

// src/snaps.ts
import { assert, isObject, assertStruct } from "@metamask/utils";
import { base64 } from "@scure/base";
import stableStringify from "fast-json-stable-stringify";
import {
  empty,
  enums,
  intersection,
  literal,
  pattern,
  refine,
  string,
  union,
  validate
} from "superstruct";
import validateNPMPackage from "validate-npm-package-name";
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
  manifestCopy.value = stableStringify(manifestCopy.result);
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
  return base64.encode(await checksumFiles(all));
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
var BaseSnapIdStruct = pattern(string(), /^[\x21-\x7E]*$/u);
var LocalSnapIdSubUrlStruct = uri({
  protocol: enums(["http:", "https:"]),
  hostname: enums(LOCALHOST_HOSTNAMES),
  hash: empty(string()),
  search: empty(string())
});
var LocalSnapIdStruct = refine(
  BaseSnapIdStruct,
  "local Snap Id",
  (value) => {
    if (!value.startsWith("local:" /* local */)) {
      return `Expected local snap ID, got "${value}".`;
    }
    const [error] = validate(
      value.slice("local:" /* local */.length),
      LocalSnapIdSubUrlStruct
    );
    return error ?? true;
  }
);
var NpmSnapIdStruct = intersection([
  BaseSnapIdStruct,
  uri({
    protocol: literal("npm:" /* npm */),
    pathname: refine(string(), "package name", function* (value) {
      const normalized = value.startsWith("/") ? value.slice(1) : value;
      const { errors, validForNewPackages, warnings } = validateNPMPackage(normalized);
      if (!validForNewPackages) {
        if (errors === void 0) {
          assert(warnings !== void 0);
          yield* warnings;
        } else {
          yield* errors;
        }
      }
      return true;
    }),
    search: empty(string()),
    hash: empty(string())
  })
]);
var HttpSnapIdStruct = intersection([
  BaseSnapIdStruct,
  uri({
    protocol: enums(["http:", "https:"]),
    search: empty(string()),
    hash: empty(string())
  })
]);
var SnapIdStruct = union([NpmSnapIdStruct, LocalSnapIdStruct]);
function getSnapPrefix(snapId) {
  const prefix = Object.values(SnapIdPrefixes).find(
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
  assertStruct(value, SnapIdStruct, "Invalid snap ID");
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
  assert(
    isObject(requestedPermissions),
    "Requested permissions must be an object."
  );
  const { wallet_snap: walletSnapPermission } = requestedPermissions;
  assert(
    isObject(walletSnapPermission),
    "wallet_snap is missing from the requested permissions."
  );
  const { caveats } = walletSnapPermission;
  assert(
    Array.isArray(caveats) && caveats.length === 1,
    "wallet_snap must have a caveat property with a single-item array value."
  );
  const [caveat] = caveats;
  assert(
    isObject(caveat) && caveat.type === "snapIds" /* SnapIds */ && isObject(caveat.value),
    `The requested permissions do not have a valid ${"snapIds" /* SnapIds */} caveat.`
  );
}

export {
  PROPOSED_NAME_REGEX,
  SnapStatus,
  SnapStatusEvents,
  ProgrammaticallyFixableSnapError,
  getSnapChecksum,
  validateSnapShasum,
  LOCALHOST_HOSTNAMES,
  BaseSnapIdStruct,
  LocalSnapIdStruct,
  NpmSnapIdStruct,
  HttpSnapIdStruct,
  SnapIdStruct,
  getSnapPrefix,
  stripSnapPrefix,
  assertIsValidSnapId,
  isCaipChainId,
  isSnapPermitted,
  verifyRequestedSnapPermissions
};
//# sourceMappingURL=chunk-2M6G46W6.mjs.map
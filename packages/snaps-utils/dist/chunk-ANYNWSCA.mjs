// src/json-rpc.ts
import { SubjectType } from "@metamask/permission-controller";
import {
  array,
  boolean,
  object,
  optional,
  refine,
  string
} from "@metamask/superstruct";
import {
  assertStruct,
  isJsonRpcFailure,
  isJsonRpcSuccess
} from "@metamask/utils";
var AllowedOriginsStruct = array(
  refine(string(), "Allowed origin", (value) => {
    const wildcards = value.split("*").length - 1;
    if (wildcards > 2) {
      return 'No more than two wildcards ("*") are allowed in an origin specifier.';
    }
    return true;
  })
);
var RpcOriginsStruct = refine(
  object({
    dapps: optional(boolean()),
    snaps: optional(boolean()),
    allowedOrigins: optional(AllowedOriginsStruct)
  }),
  "RPC origins",
  (value) => {
    const hasOrigins = Boolean(
      value.snaps === true || value.dapps === true || value.allowedOrigins && value.allowedOrigins.length > 0
    );
    if (hasOrigins) {
      return true;
    }
    return "Must specify at least one JSON-RPC origin.";
  }
);
function assertIsRpcOrigins(value, ErrorWrapper) {
  assertStruct(
    value,
    RpcOriginsStruct,
    "Invalid JSON-RPC origins",
    ErrorWrapper
  );
}
var KeyringOriginsStruct = object({
  allowedOrigins: optional(AllowedOriginsStruct)
});
function assertIsKeyringOrigins(value, ErrorWrapper) {
  assertStruct(
    value,
    KeyringOriginsStruct,
    "Invalid keyring origins",
    ErrorWrapper
  );
}
function createOriginRegExp(matcher) {
  const escaped = matcher.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
  const regex = escaped.replace(/\\\*/gu, ".*");
  return RegExp(`${regex}$`, "u");
}
function checkAllowedOrigin(matcher, origin) {
  if (matcher === "*" || matcher === origin) {
    return true;
  }
  const regex = createOriginRegExp(matcher);
  return regex.test(origin);
}
function isOriginAllowed(origins, subjectType, origin) {
  if (origin === "metamask") {
    return true;
  }
  if (origins.allowedOrigins?.some(
    (matcher) => checkAllowedOrigin(matcher, origin)
  )) {
    return true;
  }
  if (subjectType === SubjectType.Website && origins.dapps) {
    return true;
  }
  return Boolean(subjectType === SubjectType.Snap && origins.snaps);
}
function assertIsJsonRpcSuccess(value) {
  if (!isJsonRpcSuccess(value)) {
    if (isJsonRpcFailure(value)) {
      throw new Error(`JSON-RPC request failed: ${value.error.message}`);
    }
    throw new Error("Invalid JSON-RPC response.");
  }
}

export {
  RpcOriginsStruct,
  assertIsRpcOrigins,
  KeyringOriginsStruct,
  assertIsKeyringOrigins,
  isOriginAllowed,
  assertIsJsonRpcSuccess
};
//# sourceMappingURL=chunk-ANYNWSCA.mjs.map
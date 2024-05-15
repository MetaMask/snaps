// src/json-rpc.ts
import { SubjectType } from "@metamask/permission-controller";
import {
  assertStruct,
  isJsonRpcFailure,
  isJsonRpcSuccess
} from "@metamask/utils";
import { array, boolean, object, optional, refine, string } from "superstruct";
var RpcOriginsStruct = refine(
  object({
    dapps: optional(boolean()),
    snaps: optional(boolean()),
    allowedOrigins: optional(array(string()))
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
  allowedOrigins: optional(array(string()))
});
function assertIsKeyringOrigins(value, ErrorWrapper) {
  assertStruct(
    value,
    KeyringOriginsStruct,
    "Invalid keyring origins",
    ErrorWrapper
  );
}
function isOriginAllowed(origins, subjectType, origin) {
  if (origin === "metamask") {
    return true;
  }
  if (origins.allowedOrigins?.includes(origin)) {
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
//# sourceMappingURL=chunk-DKDGMZFU.mjs.map
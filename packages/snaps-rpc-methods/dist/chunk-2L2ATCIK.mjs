import {
  getValidatedParams
} from "./chunk-2CTOCP34.mjs";

// src/permitted/invokeKeyring.ts
import { rpcErrors } from "@metamask/rpc-errors";
import { HandlerType, WALLET_SNAP_PERMISSION_KEY } from "@metamask/snaps-utils";
import { hasProperty } from "@metamask/utils";
var hookNames = {
  hasPermission: true,
  handleSnapRpcRequest: true,
  getSnap: true,
  getAllowedKeyringMethods: true
};
var invokeKeyringHandler = {
  methodNames: ["wallet_invokeKeyring"],
  implementation: invokeKeyringImplementation,
  hookNames
};
async function invokeKeyringImplementation(req, res, _next, end, {
  handleSnapRpcRequest,
  hasPermission,
  getSnap,
  getAllowedKeyringMethods
}) {
  let params;
  try {
    params = getValidatedParams(req.params);
  } catch (error) {
    return end(error);
  }
  const { origin } = req;
  const { snapId, request } = params;
  if (!origin || !hasPermission(WALLET_SNAP_PERMISSION_KEY)) {
    return end(
      rpcErrors.invalidRequest({
        message: `The snap "${snapId}" is not connected to "${origin}". Please connect before invoking the snap.`
      })
    );
  }
  if (!getSnap(snapId)) {
    return end(
      rpcErrors.invalidRequest({
        message: `The snap "${snapId}" is not installed. Please install it first, before invoking the snap.`
      })
    );
  }
  if (!hasProperty(request, "method") || typeof request.method !== "string") {
    return end(
      rpcErrors.invalidRequest({
        message: "The request must have a method."
      })
    );
  }
  const allowedMethods = getAllowedKeyringMethods();
  if (!allowedMethods.includes(request.method)) {
    return end(
      rpcErrors.invalidRequest({
        message: `The origin "${origin}" is not allowed to invoke the method "${request.method}".`
      })
    );
  }
  try {
    res.result = await handleSnapRpcRequest({
      snapId,
      request,
      handler: HandlerType.OnKeyringRequest
    });
  } catch (error) {
    return end(error);
  }
  return end();
}

export {
  invokeKeyringHandler
};
//# sourceMappingURL=chunk-2L2ATCIK.mjs.map
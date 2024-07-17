// src/permitted/invokeSnapSugar.ts
import { rpcErrors } from "@metamask/rpc-errors";
import { isObject } from "@metamask/utils";
var invokeSnapSugarHandler = {
  methodNames: ["wallet_invokeSnap"],
  implementation: invokeSnapSugar,
  hookNames: {
    invokeSnap: true
  }
};
async function invokeSnapSugar(req, res, _next, end, { invokeSnap }) {
  try {
    const params = getValidatedParams(req.params);
    res.result = await invokeSnap(params);
  } catch (error) {
    return end(error);
  }
  return end();
}
function getValidatedParams(params) {
  if (!isObject(params)) {
    throw rpcErrors.invalidParams({
      message: "Expected params to be a single object."
    });
  }
  const { snapId, request } = params;
  if (!snapId || typeof snapId !== "string" || snapId === "") {
    throw rpcErrors.invalidParams({
      message: "Must specify a valid snap ID."
    });
  }
  if (!isObject(request)) {
    throw rpcErrors.invalidParams({
      message: "Expected request to be a single object."
    });
  }
  return params;
}

export {
  invokeSnapSugarHandler,
  invokeSnapSugar,
  getValidatedParams
};
//# sourceMappingURL=chunk-2CTOCP34.mjs.map
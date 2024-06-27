// src/permitted/getInterfaceState.ts
import { rpcErrors } from "@metamask/rpc-errors";
import { StructError, create, object, string } from "@metamask/superstruct";
var hookNames = {
  getInterfaceState: true
};
var getInterfaceStateHandler = {
  methodNames: ["snap_getInterfaceState"],
  implementation: getGetInterfaceStateImplementation,
  hookNames
};
var GetInterfaceStateParametersStruct = object({
  id: string()
});
function getGetInterfaceStateImplementation(req, res, _next, end, { getInterfaceState }) {
  const { params } = req;
  try {
    const validatedParams = getValidatedParams(params);
    const { id } = validatedParams;
    res.result = getInterfaceState(id);
  } catch (error) {
    return end(error);
  }
  return end();
}
function getValidatedParams(params) {
  try {
    return create(params, GetInterfaceStateParametersStruct);
  } catch (error) {
    if (error instanceof StructError) {
      throw rpcErrors.invalidParams({
        message: `Invalid params: ${error.message}.`
      });
    }
    throw rpcErrors.internal();
  }
}

export {
  getInterfaceStateHandler
};
//# sourceMappingURL=chunk-TVC3E5LI.mjs.map
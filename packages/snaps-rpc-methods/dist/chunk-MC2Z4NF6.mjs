// src/permitted/resolveInterface.ts
import { rpcErrors } from "@metamask/rpc-errors";
import { StructError, create, object, string } from "@metamask/superstruct";
import { JsonStruct } from "@metamask/utils";
var hookNames = {
  resolveInterface: true
};
var resolveInterfaceHandler = {
  methodNames: ["snap_resolveInterface"],
  implementation: getResolveInterfaceImplementation,
  hookNames
};
var ResolveInterfaceParametersStruct = object({
  id: string(),
  value: JsonStruct
});
async function getResolveInterfaceImplementation(req, res, _next, end, { resolveInterface }) {
  const { params } = req;
  try {
    const validatedParams = getValidatedParams(params);
    const { id, value } = validatedParams;
    await resolveInterface(id, value);
    res.result = null;
  } catch (error) {
    return end(error);
  }
  return end();
}
function getValidatedParams(params) {
  try {
    return create(params, ResolveInterfaceParametersStruct);
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
  resolveInterfaceHandler
};
//# sourceMappingURL=chunk-MC2Z4NF6.mjs.map
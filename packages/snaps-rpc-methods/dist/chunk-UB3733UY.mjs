// src/permitted/getAllSnaps.ts
import { rpcErrors } from "@metamask/rpc-errors";
var hookNames = {
  getAllSnaps: true
};
var getAllSnapsHandler = {
  methodNames: ["wallet_getAllSnaps"],
  implementation: getAllSnapsImplementation,
  hookNames
};
async function getAllSnapsImplementation(request, response, _next, end, { getAllSnaps }) {
  const { origin } = request;
  if (origin !== "https://snaps.metamask.io") {
    return end(rpcErrors.methodNotFound());
  }
  response.result = await getAllSnaps();
  return end();
}

export {
  getAllSnapsHandler
};
//# sourceMappingURL=chunk-UB3733UY.mjs.map
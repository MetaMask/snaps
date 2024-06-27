// src/permitted/getSnaps.ts
var hookNames = {
  getSnaps: true
};
var getSnapsHandler = {
  methodNames: ["wallet_getSnaps"],
  implementation: getSnapsImplementation,
  hookNames
};
async function getSnapsImplementation(_req, res, _next, end, { getSnaps }) {
  res.result = await getSnaps();
  return end();
}

export {
  getSnapsHandler
};
//# sourceMappingURL=chunk-CH5O2YCX.mjs.map
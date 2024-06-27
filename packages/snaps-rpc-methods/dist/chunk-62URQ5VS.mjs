// src/permitted/getClientStatus.ts
var hookNames = {
  getIsLocked: true
};
var getClientStatusHandler = {
  methodNames: ["snap_getClientStatus"],
  implementation: getClientStatusImplementation,
  hookNames
};
async function getClientStatusImplementation(_request, response, _next, end, { getIsLocked }) {
  response.result = { locked: getIsLocked() };
  return end();
}

export {
  getClientStatusHandler
};
//# sourceMappingURL=chunk-62URQ5VS.mjs.map
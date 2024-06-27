// src/internals/simulation/middleware/internal-methods/provider-state.ts
async function getProviderStateHandler(_request, response, _next, end) {
  response.result = {
    isUnlocked: true,
    chainId: "0x01",
    networkVersion: "0x01",
    accounts: []
  };
  return end();
}

export {
  getProviderStateHandler
};
//# sourceMappingURL=chunk-IXKO6X55.mjs.map
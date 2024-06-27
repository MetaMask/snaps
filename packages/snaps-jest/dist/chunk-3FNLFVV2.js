"use strict";Object.defineProperty(exports, "__esModule", {value: true});// src/internals/simulation/middleware/internal-methods/provider-state.ts
async function getProviderStateHandler(_request, response, _next, end) {
  response.result = {
    isUnlocked: true,
    chainId: "0x01",
    networkVersion: "0x01",
    accounts: []
  };
  return end();
}



exports.getProviderStateHandler = getProviderStateHandler;
//# sourceMappingURL=chunk-3FNLFVV2.js.map
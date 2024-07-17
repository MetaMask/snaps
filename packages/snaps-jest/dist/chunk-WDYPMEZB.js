"use strict";Object.defineProperty(exports, "__esModule", {value: true});// src/internals/simulation/middleware/internal-methods/accounts.ts
var _keytree = require('@metamask/key-tree');
async function getAccountsHandler(_request, response, _next, end, hooks) {
  const { getMnemonic } = hooks;
  const node = await _keytree.BIP44Node.fromDerivationPath({
    derivationPath: [
      await getMnemonic(),
      `bip32:44'`,
      `bip32:60'`,
      `bip32:0'`,
      `bip32:0`,
      `bip32:0`
    ]
  });
  response.result = [node.address];
  return end();
}



exports.getAccountsHandler = getAccountsHandler;
//# sourceMappingURL=chunk-WDYPMEZB.js.map
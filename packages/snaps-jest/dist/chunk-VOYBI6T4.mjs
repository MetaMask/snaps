// src/internals/simulation/middleware/internal-methods/accounts.ts
import { BIP44Node } from "@metamask/key-tree";
async function getAccountsHandler(_request, response, _next, end, hooks) {
  const { getMnemonic } = hooks;
  const node = await BIP44Node.fromDerivationPath({
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

export {
  getAccountsHandler
};
//# sourceMappingURL=chunk-VOYBI6T4.mjs.map
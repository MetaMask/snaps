// src/endowments/caveats/generic.ts
import { rpcErrors } from "@metamask/rpc-errors";
function createGenericPermissionValidator(caveatsToValidate) {
  const validCaveatTypes = new Set(
    caveatsToValidate.map((caveat) => caveat.type)
  );
  const requiredCaveats = caveatsToValidate.filter(
    (caveat) => !caveat.optional
  );
  return function({ caveats }) {
    const actualCaveats = caveats ?? [];
    const passedCaveatTypes = actualCaveats.map((caveat) => caveat.type);
    const passedCaveatsSet = new Set(passedCaveatTypes);
    if (passedCaveatsSet.size !== passedCaveatTypes.length) {
      throw rpcErrors.invalidParams({
        message: "Duplicate caveats are not allowed."
      });
    }
    if (!actualCaveats.every((caveat) => validCaveatTypes.has(caveat.type))) {
      throw rpcErrors.invalidParams({
        message: `Expected the following caveats: ${caveatsToValidate.map((caveat) => `"${caveat.type}"`).join(", ")}, received ${actualCaveats.map((caveat) => `"${caveat.type}"`).join(", ")}.`
      });
    }
    if (!requiredCaveats.every((caveat) => passedCaveatsSet.has(caveat.type))) {
      throw rpcErrors.invalidParams({
        message: `Expected the following caveats: ${requiredCaveats.map((caveat) => `"${caveat.type}"`).join(", ")}.`
      });
    }
  };
}

export {
  createGenericPermissionValidator
};
//# sourceMappingURL=chunk-TT4DP2YW.mjs.map
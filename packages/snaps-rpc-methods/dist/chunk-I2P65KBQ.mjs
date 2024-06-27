// src/restricted/caveats/permittedDerivationPaths.ts
import { providerErrors, rpcErrors } from "@metamask/rpc-errors";
import {
  SnapCaveatType,
  Bip32EntropyStruct,
  isEqual
} from "@metamask/snaps-utils";
import { array, size, type } from "@metamask/superstruct";
import { assertStruct } from "@metamask/utils";
function permittedDerivationPathsCaveatMapper(value) {
  return {
    caveats: [
      {
        type: SnapCaveatType.PermittedDerivationPaths,
        value
      }
    ]
  };
}
function validateBIP32Path(value) {
  assertStruct(
    value,
    Bip32EntropyStruct,
    "Invalid BIP-32 entropy path definition",
    rpcErrors.invalidParams
  );
}
function validateBIP32CaveatPaths(caveat) {
  assertStruct(
    caveat,
    type({ value: size(array(Bip32EntropyStruct), 1, Infinity) }),
    "Invalid BIP-32 entropy caveat",
    rpcErrors.internal
  );
}
var PermittedDerivationPathsCaveatSpecification = {
  [SnapCaveatType.PermittedDerivationPaths]: Object.freeze({
    type: SnapCaveatType.PermittedDerivationPaths,
    decorator: (method, caveat) => {
      return async (args) => {
        const { params } = args;
        validateBIP32Path(params);
        const path = caveat.value.find(
          (caveatPath) => isEqual(
            params.path.slice(0, caveatPath.path.length),
            caveatPath.path
          ) && caveatPath.curve === params.curve
        );
        if (!path) {
          throw providerErrors.unauthorized({
            message: "The requested path is not permitted. Allowed paths must be specified in the snap manifest."
          });
        }
        return await method(args);
      };
    },
    validator: (caveat) => validateBIP32CaveatPaths(caveat)
  })
};

export {
  permittedDerivationPathsCaveatMapper,
  validateBIP32Path,
  validateBIP32CaveatPaths,
  PermittedDerivationPathsCaveatSpecification
};
//# sourceMappingURL=chunk-I2P65KBQ.mjs.map
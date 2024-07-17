import {
  PermittedCoinTypesCaveatSpecification,
  permittedCoinTypesCaveatMapper
} from "./chunk-PIAWDTWO.mjs";
import {
  PermittedDerivationPathsCaveatSpecification,
  permittedDerivationPathsCaveatMapper
} from "./chunk-I2P65KBQ.mjs";
import {
  SnapIdsCaveatSpecification,
  snapIdsCaveatMapper
} from "./chunk-FJ7COFRJ.mjs";
import {
  getBip32PublicKeyBuilder
} from "./chunk-VYII7C3J.mjs";
import {
  getBip44EntropyBuilder
} from "./chunk-LR7UR4YU.mjs";
import {
  getBip32EntropyBuilder
} from "./chunk-LXJBBRQ4.mjs";
import {
  invokeSnapBuilder
} from "./chunk-VVBTXSID.mjs";

// src/restricted/caveats/index.ts
var caveatSpecifications = {
  ...PermittedDerivationPathsCaveatSpecification,
  ...PermittedCoinTypesCaveatSpecification,
  ...SnapIdsCaveatSpecification
};
var caveatMappers = {
  [getBip32EntropyBuilder.targetName]: permittedDerivationPathsCaveatMapper,
  [getBip32PublicKeyBuilder.targetName]: permittedDerivationPathsCaveatMapper,
  [getBip44EntropyBuilder.targetName]: permittedCoinTypesCaveatMapper,
  [invokeSnapBuilder.targetName]: snapIdsCaveatMapper
};

export {
  caveatSpecifications,
  caveatMappers
};
//# sourceMappingURL=chunk-FNUO7MQ4.mjs.map
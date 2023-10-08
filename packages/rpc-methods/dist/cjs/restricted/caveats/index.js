"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    caveatSpecifications: function() {
        return caveatSpecifications;
    },
    caveatMappers: function() {
        return caveatMappers;
    }
});
const _getBip32Entropy = require("../getBip32Entropy");
const _getBip32PublicKey = require("../getBip32PublicKey");
const _getBip44Entropy = require("../getBip44Entropy");
const _invokeSnap = require("../invokeSnap");
const _permittedCoinTypes = require("./permittedCoinTypes");
const _permittedDerivationPaths = require("./permittedDerivationPaths");
const _snapIds = require("./snapIds");
const caveatSpecifications = {
    ..._permittedDerivationPaths.PermittedDerivationPathsCaveatSpecification,
    ..._permittedCoinTypes.PermittedCoinTypesCaveatSpecification,
    ..._snapIds.SnapIdsCaveatSpecification
};
const caveatMappers = {
    [_getBip32Entropy.getBip32EntropyBuilder.targetName]: _permittedDerivationPaths.permittedDerivationPathsCaveatMapper,
    [_getBip32PublicKey.getBip32PublicKeyBuilder.targetName]: _permittedDerivationPaths.permittedDerivationPathsCaveatMapper,
    [_getBip44Entropy.getBip44EntropyBuilder.targetName]: _permittedCoinTypes.permittedCoinTypesCaveatMapper,
    [_invokeSnap.invokeSnapBuilder.targetName]: _snapIds.snapIdsCaveatMapper
};

//# sourceMappingURL=index.js.map
"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "ethereumProviderEndowmentBuilder", {
    enumerable: true,
    get: function() {
        return ethereumProviderEndowmentBuilder;
    }
});
const _permissioncontroller = require("@metamask/permission-controller");
const _enum = require("./enum");
const permissionName = _enum.SnapEndowments.EthereumProvider;
/**
 * `endowment:ethereum-provider` returns the name of the ethereum global browser API.
 * This is intended to populate the endowments of the
 * SES Compartment in which a Snap executes.
 *
 * This populates the global scope with an EIP-1193 provider, which DOES NOT implement all legacy functionality exposed to dapps.
 *
 * @param _builderOptions - Optional specification builder options.
 * @returns The specification for the network endowment.
 */ const specificationBuilder = (_builderOptions)=>{
    return {
        permissionType: _permissioncontroller.PermissionType.Endowment,
        targetName: permissionName,
        allowedCaveats: null,
        endowmentGetter: (_getterOptions)=>{
            return [
                'ethereum'
            ];
        },
        subjectTypes: [
            _permissioncontroller.SubjectType.Snap
        ]
    };
};
const ethereumProviderEndowmentBuilder = Object.freeze({
    targetName: permissionName,
    specificationBuilder
});

//# sourceMappingURL=ethereum-provider.js.map
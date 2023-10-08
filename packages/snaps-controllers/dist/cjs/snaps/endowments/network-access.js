"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "networkAccessEndowmentBuilder", {
    enumerable: true,
    get: function() {
        return networkAccessEndowmentBuilder;
    }
});
const _permissioncontroller = require("@metamask/permission-controller");
const _enum = require("./enum");
const permissionName = _enum.SnapEndowments.NetworkAccess;
/**
 * `endowment:network-access` returns the name of global browser API(s) that
 * enable network access. This is intended to populate the endowments of the
 * SES Compartment in which a Snap executes.
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
                'fetch',
                'Request',
                'Headers',
                'Response'
            ];
        },
        subjectTypes: [
            _permissioncontroller.SubjectType.Snap
        ]
    };
};
const networkAccessEndowmentBuilder = Object.freeze({
    targetName: permissionName,
    specificationBuilder
});

//# sourceMappingURL=network-access.js.map
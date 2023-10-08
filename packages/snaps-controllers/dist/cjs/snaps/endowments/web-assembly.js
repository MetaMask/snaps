"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "webAssemblyEndowmentBuilder", {
    enumerable: true,
    get: function() {
        return webAssemblyEndowmentBuilder;
    }
});
const _permissioncontroller = require("@metamask/permission-controller");
const _enum = require("./enum");
const permissionName = _enum.SnapEndowments.WebAssemblyAccess;
/**
 * `endowment:webassembly` returns the name of global browser API(s) that
 * enable access to the WebAssembly API.
 * This is intended to populate the endowments of the SES Compartment
 * in which a Snap executes.
 *
 * @param _builderOptions - Optional specification builder options.
 * @returns The specification for the WebAssembly endowment.
 */ const specificationBuilder = (_builderOptions)=>{
    return {
        permissionType: _permissioncontroller.PermissionType.Endowment,
        targetName: permissionName,
        allowedCaveats: null,
        endowmentGetter: (_getterOptions)=>{
            return [
                'WebAssembly'
            ];
        },
        subjectTypes: [
            _permissioncontroller.SubjectType.Snap
        ]
    };
};
const webAssemblyEndowmentBuilder = Object.freeze({
    targetName: permissionName,
    specificationBuilder
});

//# sourceMappingURL=web-assembly.js.map
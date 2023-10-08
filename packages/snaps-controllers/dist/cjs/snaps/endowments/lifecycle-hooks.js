"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "lifecycleHooksEndowmentBuilder", {
    enumerable: true,
    get: function() {
        return lifecycleHooksEndowmentBuilder;
    }
});
const _permissioncontroller = require("@metamask/permission-controller");
const _enum = require("./enum");
const permissionName = _enum.SnapEndowments.LifecycleHooks;
/**
 * `endowment:lifecycle-hooks` returns nothing; it is intended to be used as a
 * flag by the snap controller to detect whether the snap has the capability to
 * use lifecycle hooks.
 *
 * @param _builderOptions - Optional specification builder options.
 * @returns The specification for the `lifecycle-hooks` endowment.
 */ const specificationBuilder = (_builderOptions)=>{
    return {
        permissionType: _permissioncontroller.PermissionType.Endowment,
        targetName: permissionName,
        allowedCaveats: null,
        endowmentGetter: (_getterOptions)=>undefined,
        subjectTypes: [
            _permissioncontroller.SubjectType.Snap
        ]
    };
};
const lifecycleHooksEndowmentBuilder = Object.freeze({
    targetName: permissionName,
    specificationBuilder
});

//# sourceMappingURL=lifecycle-hooks.js.map
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
    specificationBuilder: function() {
        return specificationBuilder;
    },
    getLocaleBuilder: function() {
        return getLocaleBuilder;
    },
    getImplementation: function() {
        return getImplementation;
    }
});
const _permissioncontroller = require("@metamask/permission-controller");
const methodName = 'snap_getLocale';
const specificationBuilder = ({ allowedCaveats = null, methodHooks })=>{
    return {
        permissionType: _permissioncontroller.PermissionType.RestrictedMethod,
        targetName: methodName,
        allowedCaveats,
        methodImplementation: getImplementation(methodHooks),
        subjectTypes: [
            _permissioncontroller.SubjectType.Snap
        ]
    };
};
const methodHooks = {
    getLocale: true
};
const getLocaleBuilder = Object.freeze({
    targetName: methodName,
    specificationBuilder,
    methodHooks
});
function getImplementation({ getLocale }) {
    return async function implementation(_args) {
        return getLocale();
    };
}

//# sourceMappingURL=getLocale.js.map
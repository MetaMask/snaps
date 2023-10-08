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
    NotificationType: function() {
        return NotificationType;
    },
    specificationBuilder: function() {
        return specificationBuilder;
    },
    notifyBuilder: function() {
        return notifyBuilder;
    },
    getImplementation: function() {
        return getImplementation;
    },
    getValidatedParams: function() {
        return getValidatedParams;
    }
});
const _permissioncontroller = require("@metamask/permission-controller");
const _utils = require("@metamask/utils");
const _ethrpcerrors = require("eth-rpc-errors");
const methodName = 'snap_notify';
var NotificationType;
(function(NotificationType) {
    NotificationType["InApp"] = 'inApp';
    NotificationType["Native"] = 'native';
})(NotificationType || (NotificationType = {}));
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
    showNativeNotification: true,
    showInAppNotification: true
};
const notifyBuilder = Object.freeze({
    targetName: methodName,
    specificationBuilder,
    methodHooks
});
function getImplementation({ showNativeNotification, showInAppNotification }) {
    return async function implementation(args) {
        const { params, context: { origin } } = args;
        const validatedParams = getValidatedParams(params);
        switch(validatedParams.type){
            case NotificationType.Native:
                return await showNativeNotification(origin, validatedParams);
            case NotificationType.InApp:
                return await showInAppNotification(origin, validatedParams);
            default:
                throw _ethrpcerrors.ethErrors.rpc.invalidParams({
                    message: 'Must specify a valid notification "type".'
                });
        }
    };
}
function getValidatedParams(params) {
    if (!(0, _utils.isObject)(params)) {
        throw _ethrpcerrors.ethErrors.rpc.invalidParams({
            message: 'Expected params to be a single object.'
        });
    }
    const { type, message } = params;
    if (!type || typeof type !== 'string' || !Object.values(NotificationType).includes(type)) {
        throw _ethrpcerrors.ethErrors.rpc.invalidParams({
            message: 'Must specify a valid notification "type".'
        });
    }
    // Set to the max message length on a Mac notification for now.
    if (!message || typeof message !== 'string' || message.length >= 50) {
        throw _ethrpcerrors.ethErrors.rpc.invalidParams({
            message: 'Must specify a non-empty string "message" less than 50 characters long.'
        });
    }
    return params;
}

//# sourceMappingURL=notify.js.map